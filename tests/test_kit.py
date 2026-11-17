"""Contact kit tests: URL building in the real library, plus a browser check that nothing
third-party loads until the map is tapped. Run: python tests/test_kit.py  (needs playwright + chromium)"""
import re, http.server, socketserver, threading, pathlib, sys, functools
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
H.log_message = lambda *a, **k: None
srv = socketserver.TCPServer(("127.0.0.1", 0), H); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{port}"
fails = []
def check(name, got, want):
    ok = got == want
    print(("ok   " if ok else "FAIL ") + name + ("" if ok else f"\n     got  {got!r}\n     want {want!r}"))
    if not ok: fails.append(name)

PAGE = """<!doctype html><meta charset=utf-8><script src=/contact-kit.js></script>
<contact-kit id=k phone="912 345 678" whatsapp="+351 912 345 678" telegram="@brightside" email="a@b.pt"
 message="Olá, quero um orçamento & prazo" address="Rua X 1" lat="41.1496" lon="-8.6110" lang="pt"></contact-kit>"""
(ROOT / "tests" / "_page.html").write_text(PAGE)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    reqs = []
    pg.on("request", lambda r: reqs.append(r.url))
    pg.goto(base + "/tests/_page.html"); pg.wait_for_selector("contact-kit")
    K = lambda js: pg.evaluate(js)
    # phone normalisation
    check("intl plus", K("ContactKit.intl('+351 912 345 678')"), "351912345678")
    check("intl 00", K("ContactKit.intl('00351912345678')"), "351912345678")
    check("intl local", K("ContactKit.intl('912345678')"), "351912345678")
    check("intl leading 0", K("ContactKit.intl('0912345678','351')"), "351912345678")
    check("intl already has cc", K("ContactKit.intl('351912345678')"), "351912345678")
    check("intl other country", K("ContactKit.intl('7911 123456','44')"), "447911123456")
    check("intl empty", K("ContactKit.intl('')"), "")
    check("wa", K("ContactKit.waLink('912345678','Olá & prazo')"), "https://wa.me/351912345678?text=Ol%C3%A1%20%26%20prazo")
    check("wa no msg", K("ContactKit.waLink('+351912345678','')"), "https://wa.me/351912345678")
    check("tel", K("ContactKit.telLink('912 345 678')"), "tel:+351912345678")
    check("tg user", K("ContactKit.tgLink('@brightside','Hi there')"), "https://t.me/brightside?text=Hi%20there")
    check("tg url", K("ContactKit.tgLink('https://t.me/brightside','')"), "https://t.me/brightside")
    check("tg phone", K("ContactKit.tgLink('+351 912 345 678','Hi')"), "https://t.me/+351912345678?text=Hi")
    check("mail", K("ContactKit.mailLink('a@b.pt','Hi','Q')"), "mailto:a@b.pt?subject=Q&body=Hi")
    check("maps link", K("ContactKit.mapsLink('41.1','-8.6','')"), "https://www.google.com/maps/search/?api=1&query=41.1%2C-8.6")
    # rendered buttons
    hrefs = K("[...document.getElementById('k').shadowRoot.querySelectorAll('a.b[data-k]')].map(a=>a.getAttribute('href'))")
    check("button order", [h.split(':')[0] for h in hrefs], ["https", "tel", "https", "mailto"])
    check("wa button href", hrefs[0], "https://wa.me/351912345678?text=Ol%C3%A1%2C%20quero%20um%20or%C3%A7amento%20%26%20prazo")
    labels = K("[...document.getElementById('k').shadowRoot.querySelectorAll('a.b[data-k] span')].map(s=>s.textContent)")
    check("pt labels", labels, ["WhatsApp", "Ligar", "Telegram", "Email"])
    # nothing from other sites before the tap
    other = [u for u in reqs if not u.startswith(base)]
    check("no third-party requests on load", other, [])
    check("no iframe before tap", K("document.getElementById('k').shadowRoot.querySelectorAll('iframe').length"), 0)
    # tap
    pg.evaluate("document.getElementById('k').shadowRoot.querySelector('[data-map]').click()")
    src = K("document.getElementById('k').shadowRoot.querySelector('iframe').src")
    check("iframe after tap", src.startswith("https://www.openstreetmap.org/export/embed.html?bbox="), True)
    check("marker in iframe", "marker=41.1496%2C-8.611" in src, True)
    # default message per language + bar layout
    pg.set_content("<script src='%s/contact-kit.js'></script><contact-kit id=k whatsapp='912345678' lang='ru' layout='bar' lat='1' lon='2'></contact-kit>" % base)
    pg.wait_for_selector("contact-kit")
    check("ru default message", "text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2" in K("document.getElementById('k').shadowRoot.querySelector('a').href"), True)
    check("bar hides map", K("document.getElementById('k').shadowRoot.querySelectorAll('.map').length"), 0)
    # generator page
    reqs.clear(); pg.goto(base + "/index.html"); pg.wait_for_selector("#stage")
    pg.fill("#whatsapp", "912345678"); pg.select_option("#lang", "pt"); pg.wait_for_selector("#stage contact-kit")
    code = pg.inner_text("#code")
    check("snippet has attrs", 'whatsapp="912345678"' in code and 'lang="pt"' in code, True)
    check("snippet has script", code.startswith('<script src="contact-kit.js" defer></script>'), True)
    check("generator makes no third-party requests", [u for u in reqs if not u.startswith(base)], [])
    with pg.expect_download() as d: pg.click("#dl")
    html = pathlib.Path(d.value.path()).read_text()
    check("download is self-contained", "<contact-kit" in html and "customElements.define" in html and '<script src=' not in re.sub(r'/\*.*?\*/', '', html, flags=re.S), True)
    b.close()
try: (ROOT / "tests" / "_page.html").unlink()
except OSError: pass
print("\n%d failed" % len(fails) if fails else "\nall passed"); sys.exit(1 if fails else 0)
