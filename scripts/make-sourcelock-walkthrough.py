from __future__ import annotations

import io
import struct
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parents[1]
DEMO = ROOT / "demo"
OUT = DEMO / "sourcelock-protocole-comprehensive-walkthrough.avi"
SCRIPT = DEMO / "sourcelock-protocole-walkthrough-narration.txt"
W, H = 1280, 720
FPS = 4

BG = (239, 240, 251)
PANEL = (255, 255, 255)
PANEL_SOFT = (247, 246, 255)
INK = (25, 24, 35)
MUTED = (92, 86, 110)
LINE = (218, 215, 232)
PURPLE = (93, 53, 223)
PURPLE_DARK = (23, 0, 91)
TEAL = (50, 211, 182)
YELLOW = (255, 244, 106)
ORANGE = (255, 158, 89)
RED = (230, 74, 100)
GREEN = (49, 189, 114)


def font(size: int, bold: bool = False):
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


TITLE = font(64, True)
HEAD = font(36, True)
BODY = font(25)
BODY_BOLD = font(25, True)
MONO = font(20)
SMALL = font(17)
SMALL_BOLD = font(17, True)


def rounded(draw, xy, fill=PANEL, outline=None, width=1, radius=8):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def wrap(draw, text: str, xy, max_width: int, fnt, fill=INK, spacing=7):
    x, y = xy
    avg = max(8, int(fnt.size * 0.52))
    lines = []
    for para in text.split("\n"):
        lines.extend(textwrap.wrap(para, width=max(14, max_width // avg)) or [""])
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + spacing
    return y


def base(title="SourceLock Protocole"):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    rounded(d, (24, 24, 272, 696), fill=PANEL, outline=LINE)
    d.ellipse((58, 58, 68, 68), fill=INK)
    d.ellipse((84, 46, 94, 56), fill=INK)
    d.ellipse((110, 58, 120, 68), fill=INK)
    d.line((66, 62, 88, 51), fill=INK, width=4)
    d.line((92, 51, 114, 62), fill=INK, width=4)
    d.text((134, 43), "sourcelock", font=BODY_BOLD, fill=INK)
    d.text((134, 70), "protocole", font=SMALL_BOLD, fill=MUTED)
    nav = ["Dashboard", "Source Watch", "Claims", "Reviews", "History"]
    y = 126
    for i, item in enumerate(nav):
        fill = PURPLE if i == 0 else PANEL
        text = (255, 255, 255) if i == 0 else INK
        rounded(d, (48, y, 248, y + 46), fill=fill, radius=8)
        d.text((70, y + 12), item, font=SMALL_BOLD, fill=text)
        y += 58
    rounded(d, (48, 520, 248, 654), fill=PANEL_SOFT, outline=LINE)
    d.text((68, 542), "Intelligent Contract", font=SMALL_BOLD, fill=INK)
    wrap(d, "Snapshots, hashes, consensus reviews, and bonded challenges.", (68, 574), 150, SMALL, MUTED)
    d.text((320, 52), "GenLayer StudioNet", font=SMALL_BOLD, fill=PURPLE)
    d.text((320, 78), title, font=TITLE, fill=INK)
    return im, d


def card(draw, xy, heading, value, sub, fill=PANEL):
    rounded(draw, xy, fill=fill, outline=None)
    x1, y1, _, _ = xy
    draw.text((x1 + 24, y1 + 22), heading, font=SMALL_BOLD, fill=PURPLE)
    draw.text((x1 + 24, y1 + 54), value, font=TITLE, fill=INK if fill != PURPLE_DARK else (255, 255, 255))
    draw.text((x1 + 24, y1 + 126), sub, font=SMALL_BOLD, fill=MUTED if fill != PURPLE_DARK else (220, 215, 255))


def title_slide():
    im, d = base("SourceLock Protocole")
    rounded(d, (320, 150, 1210, 260), fill=PANEL)
    d.text((344, 178), "Contract-backed public source commitments", font=HEAD, fill=INK)
    wrap(d, "SourceLock Protocole locks a URL, hashes the page, re-checks it through GenLayer consensus, and lets challengers bond counter-evidence when a public promise drifts.", (344, 222), 790, SMALL, MUTED)
    card(d, (320, 300, 585, 500), "Registry integrity", "100.00", "1 stable source on-chain", PURPLE_DARK)
    card(d, (610, 300, 875, 500), "Open pressure", "0", "0 changed, 0 challenged", PANEL)
    card(d, (900, 300, 1210, 500), "Reviews completed", "1", "2 GEN bonded in lifecycle", PANEL)
    rounded(d, (320, 540, 1210, 618), fill=PANEL)
    d.text((344, 566), "Production: https://sourcelock-protocole.vercel.app", font=MONO, fill=INK)
    d.text((344, 594), "Contract: 0x00DBBA73dAd28d25FFB16EaF8D15bb387e79E130", font=MONO, fill=PURPLE)
    return im


def problem_slide():
    im, d = base("The Problem")
    rounded(d, (320, 150, 1210, 622), fill=PANEL)
    d.text((348, 178), "Public claims need durable source proof", font=HEAD, fill=INK)
    points = [
        ("Sources drift", "Docs, policy pages, pricing pages, and roadmap statements can change after people rely on them."),
        ("Screenshots are weak", "A screenshot proves presentation, not a live source, its hash, or a repeatable review path."),
        ("Disputes need bonds", "Challenge flow adds economic weight so counter-evidence is explicit, recorded, and settled."),
        ("GenLayer fits the gap", "Validators can fetch web content and reason over material change with consensus."),
    ]
    y = 252
    for heading, copy in points:
        d.ellipse((354, y + 7, 371, y + 24), fill=PURPLE)
        d.text((392, y), heading, font=BODY_BOLD, fill=INK)
        y = wrap(d, copy, (392, y + 34), 720, SMALL, MUTED) + 18
    return im


def mechanism_slide():
    im, d = base("How It Works")
    steps = [
        ("1", "Lock source", "A claimant bonds a precise commitment and the contract snapshots the URL."),
        ("2", "Review drift", "Validators re-fetch the page and classify whether the promise is stable or materially changed."),
        ("3", "Challenge", "A third party posts bonded counter-evidence instead of relying on silent status decay."),
        ("4", "Settle", "Consensus accepts or rejects the challenge and releases bonds accordingly."),
    ]
    y = 164
    for number, label, copy in steps:
        rounded(d, (320, y, 1210, y + 96), fill=PANEL, outline=LINE)
        d.ellipse((344, y + 24, 394, y + 74), fill=PURPLE)
        d.text((361, y + 34), number, font=SMALL_BOLD, fill=(255, 255, 255))
        d.text((420, y + 18), label, font=HEAD, fill=INK)
        wrap(d, copy, (420, y + 58), 700, SMALL, MUTED)
        y += 114
    return im


def architecture_slide():
    im, d = base("Architecture")
    columns = [
        ("Next.js dashboard", "Nodepay-inspired operating view, wallet actions, source lists, and live ledger."),
        ("API read route", "Server route normalizes GenLayer reads for registry, source, review, and challenge views."),
        ("GenLayer contract", "SourceLock.py stores bonded commitments and performs web-aware consensus checks."),
        ("StudioNet state", "Finalized transactions hold sources, reviews, challenges, verdicts, and bond totals."),
    ]
    x = 320
    for i, (heading, copy) in enumerate(columns):
        fill = PURPLE_DARK if i == 2 else PANEL
        text = (255, 255, 255) if i == 2 else INK
        sub = (222, 218, 255) if i == 2 else MUTED
        rounded(d, (x, 170, x + 205, 550), fill=fill, outline=LINE)
        d.text((x + 22, 202), f"0{i + 1}", font=HEAD, fill=TEAL if i == 2 else PURPLE)
        wrap(d, heading, (x + 22, 270), 160, BODY_BOLD, text)
        wrap(d, copy, (x + 22, 348), 160, SMALL, sub)
        if i < len(columns) - 1:
            d.line((x + 214, 350, x + 246, 350), fill=PURPLE, width=4)
            d.polygon([(x + 246, 350), (x + 234, 342), (x + 234, 358)], fill=PURPLE)
        x += 225
    return im


def live_slide():
    im, d = base("Live Contract State")
    rows = [
        ("Source", "sourcelock-readme-*", "STABLE", "README commitment preserved"),
        ("Review", "review_source", "STABLE / 100", "validators agreed the current page still matches"),
        ("Challenge", "resolve_challenge", "REJECTED", "counter-evidence did not prove drift"),
        ("Registry", "get_registry", "1 source", "stable_sources=1, total_bonded=2"),
    ]
    y = 170
    for kind, name, status, detail in rows:
        rounded(d, (320, y, 1210, y + 92), fill=PANEL, outline=LINE)
        d.text((346, y + 18), kind, font=SMALL_BOLD, fill=PURPLE)
        d.text((346, y + 48), name, font=MONO, fill=INK)
        d.text((700, y + 22), status, font=BODY_BOLD, fill=GREEN if "STABLE" in status or "REJECTED" in status else PURPLE)
        wrap(d, detail, (700, y + 54), 430, SMALL, MUTED)
        y += 108
    return im


def ui_flow_slide():
    im, d = base("Dashboard Flow")
    areas = [
        ("Top strip", "Contract address, wallet state, and refresh action."),
        ("Metrics", "Registry integrity, open pressure, reviews completed, and bonded total."),
        ("Source watch", "Filterable contract-backed commitments with host, claimant, status, score, and timestamps."),
        ("Action panels", "Lock source, request review, and open challenge through wallet-backed writes."),
        ("Live ledger", "Recent reviews and challenges, populated only by contract reads."),
    ]
    y = 150
    for i, (heading, copy) in enumerate(areas):
        x = 320 if i % 2 == 0 else 770
        if i % 2 == 0 and i:
            y += 112
        rounded(d, (x, y, x + 415, y + 92), fill=PANEL, outline=LINE)
        d.text((x + 22, y + 16), heading, font=BODY_BOLD, fill=INK)
        wrap(d, copy, (x + 22, y + 48), 350, SMALL, MUTED)
    return im


def tx_slide():
    im, d = base("Transaction Proof")
    txs = [
        ("Deploy", "0xac3b271db92371c0291d42cfbfa7a2477ff33aa9c396bd7bf017fb5b0d0c7ff6"),
        ("Lock", "0xc0cd87560f1fc0d263b9c043da9873070c43b2827f1d4f80728ba84270ca1d08"),
        ("Review", "0xf89ca4b2bfac6d8c330f9683d5a042b2c38d9fe78518f217411c5bac8d8c1750"),
        ("Challenge", "0x5c7f8792620942b77b1369c6dc7e19fd600e212080d56ffd1895e025f452a98c"),
        ("Resolve", "0x03c72fd1ffaa9c2b260372cd56f87e42f44a53d664f7a5a397e3db42f625d9fa"),
    ]
    y = 158
    for label, tx in txs:
        rounded(d, (320, y, 1210, y + 78), fill=PANEL, outline=LINE)
        d.text((346, y + 18), label, font=BODY_BOLD, fill=INK)
        d.text((500, y + 24), tx[:44] + "...", font=MONO, fill=PURPLE)
        y += 92
    return im


def ui_slide():
    im, d = base("What Changed")
    rounded(d, (320, 150, 1210, 626), fill=PANEL)
    d.text((348, 178), "First screen is the product, not a landing page", font=HEAD, fill=INK)
    bullets = [
        "Product name and deployment target are SourceLock Protocole / sourcelock-protocole.",
        "Reads get_registry, list_sources, list_reviews, and list_challenges from StudioNet.",
        "Shows no invented rows: empty state means the contract actually has no matching records.",
        "Writes through wallet-backed actions: lock_source, review_source, and open_challenge.",
        "Vercel Authentication is disabled so the public app and API are accessible.",
    ]
    y = 250
    for bullet in bullets:
        d.ellipse((354, y + 8, 370, y + 24), fill=TEAL)
        y = wrap(d, bullet, (390, y), 720, BODY, INK) + 16
    return im


def deployment_slide():
    im, d = base("Deployment")
    rounded(d, (320, 154, 1210, 614), fill=PANEL)
    rows = [
        ("GitHub", "https://github.com/Hilda26/sourcelock"),
        ("Vercel", "https://sourcelock-protocole.vercel.app"),
        ("Project", "sourcelock-protocole"),
        ("Contract", "0x00DBBA73dAd28d25FFB16EaF8D15bb387e79E130"),
        ("Endpoint", "https://studio.genlayer.com/api"),
    ]
    y = 200
    for label, value in rows:
        d.text((354, y), label, font=BODY_BOLD, fill=PURPLE)
        d.text((520, y + 2), value, font=MONO, fill=INK)
        y += 70
    rounded(d, (344, 560, 1185, 588), fill=(230, 255, 247))
    d.text((362, 564), "Public access verified with homepage 200 OK and live registry API response.", font=SMALL_BOLD, fill=(5, 104, 78))
    return im


def verification_slide():
    im, d = base("Verification")
    rounded(d, (320, 154, 1210, 570), fill=PANEL)
    checks = [
        "npm run lint - passed",
        "npx next build --webpack - passed",
        "genvm-lint check contracts/SourceLock.py --json - passed",
        "Production API get_registry - reads live StudioNet state",
        "Vercel Authentication - disabled for public access",
        "Live lifecycle - lock, review, challenge, resolve - passed",
    ]
    y = 200
    for check in checks:
        d.text((354, y), "OK", font=SMALL_BOLD, fill=GREEN)
        d.text((410, y), check, font=BODY, fill=INK)
        y += 58
    rounded(d, (320, 598, 1210, 650), fill=PURPLE_DARK)
    d.text((348, 613), "Production: https://sourcelock-protocole.vercel.app", font=MONO, fill=(255, 255, 255))
    return im


def jpeg_bytes(im):
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=88)
    data = buf.getvalue()
    if len(data) % 2:
        data += b"\0"
    return data


def avi(frames, durations):
    encoded = []
    for im, seconds in zip(frames, durations):
        frame = jpeg_bytes(im)
        encoded.extend([frame] * int(seconds * FPS))

    movi = io.BytesIO()
    index = []
    offset = 4
    for frame in encoded:
        movi.write(b"00dc")
        movi.write(struct.pack("<I", len(frame)))
        movi.write(frame)
        index.append((b"00dc", 0x10, offset, len(frame)))
        offset += 8 + len(frame)
    movi_data = movi.getvalue()

    hdrl = io.BytesIO()
    total_frames = len(encoded)
    hdrl.write(b"avih")
    hdrl.write(struct.pack("<I", 56))
    hdrl.write(struct.pack("<IIIIIIIIIIIIII", int(1_000_000 / FPS), 0, 0, 0x10, total_frames, 0, 1, 0, W, H, 0, 0, 0, 0))
    strl = io.BytesIO()
    strl.write(b"strh")
    strl.write(struct.pack("<I", 56))
    strl.write(struct.pack("<4s4sIHHIIIIIIIIhhhh", b"vids", b"MJPG", 0, 0, 0, 0, 1, FPS, 0, total_frames, 0, 0xFFFFFFFF, 0, 0, 0, W, H))
    strl.write(b"strf")
    strl.write(struct.pack("<I", 40))
    strl.write(struct.pack("<IiiHH4sIIiiII", 40, W, H, 1, 24, b"MJPG", W * H * 3, 0, 0, 0, 0, 0))
    strl_data = strl.getvalue()
    hdrl.write(b"LIST")
    hdrl.write(struct.pack("<I", len(strl_data) + 4))
    hdrl.write(b"strl")
    hdrl.write(strl_data)
    hdrl_data = hdrl.getvalue()

    idx = io.BytesIO()
    idx.write(b"idx1")
    idx.write(struct.pack("<I", len(index) * 16))
    for fourcc, flags, off, size in index:
        idx.write(struct.pack("<4sIII", fourcc, flags, off, size))
    idx_data = idx.getvalue()

    body = io.BytesIO()
    body.write(b"LIST")
    body.write(struct.pack("<I", len(hdrl_data) + 4))
    body.write(b"hdrl")
    body.write(hdrl_data)
    body.write(b"LIST")
    body.write(struct.pack("<I", len(movi_data) + 4))
    body.write(b"movi")
    body.write(movi_data)
    body.write(idx_data)
    riff_data = body.getvalue()

    with OUT.open("wb") as f:
        f.write(b"RIFF")
        f.write(struct.pack("<I", len(riff_data) + 4))
        f.write(b"AVI ")
        f.write(riff_data)


def main():
    DEMO.mkdir(exist_ok=True)
    frames = [
        title_slide(),
        problem_slide(),
        mechanism_slide(),
        architecture_slide(),
        live_slide(),
        ui_flow_slide(),
        tx_slide(),
        ui_slide(),
        deployment_slide(),
        verification_slide(),
    ]
    avi(frames, [5, 5, 5, 5, 5, 5, 6, 5, 5, 5])
    SCRIPT.write_text(
        "\n".join(
            [
                "SourceLock Protocole comprehensive walkthrough video.",
                "1. The app is a GenLayer StudioNet product, not a mock dashboard.",
                "2. The problem: source-backed claims can drift, and screenshots are not enough.",
                "3. A claimant bonds a URL, the Intelligent Contract snapshots and hashes it, and reviews re-fetch the source.",
                "4. Challenges post bonded counter-evidence and are resolved by validator consensus.",
                "5. The frontend reads live registry, source, review, and challenge state through the API route.",
                "6. Wallet-backed writes call lock_source, review_source, and open_challenge.",
                "7. Live StudioNet proof: deploy, lock, review, open challenge, and resolve challenge all finalized.",
                "8. Public Vercel access is enabled at https://sourcelock-protocole.vercel.app.",
            ]
        )
    )
    print(f"WROTE_VIDEO={OUT}")
    print(f"WROTE_SCRIPT={SCRIPT}")


if __name__ == "__main__":
    main()
