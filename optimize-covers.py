from PIL import Image
import os, time

src = r"C:\Users\user\.qclaw\workspace\owen-style-v2\images\weddings"
out = r"C:\Users\user\.qclaw\workspace\owen-style-v2\images\weddings\optimized"
os.makedirs(out, exist_ok=True)

files = [f for f in os.listdir(src) if f.lower().endswith(('.jpg', '.jpeg', '.png')) and os.path.isfile(os.path.join(src, f))]

print(f"共 {len(files)} 張封面圖待處理\n")
before_total = 0
after_total = 0

for i, fname in enumerate(sorted(files), 1):
    src_path = os.path.join(src, fname)
    dst_path = os.path.join(out, fname)
    before = os.path.getsize(src_path)
    before_total += before

    try:
        img = Image.open(src_path)
        w, h = img.size
        print(f"[{i:02d}/{len(files)}] {fname[:40]:<40}  {w:>4}×{h:>4}  {before/1e6:.1f}MB → ", end="", flush=True)

        # Only resize if larger than 1600px wide
        if w > 1600:
            ratio = 1600 / w
            new_w, new_h = 1600, int(h * ratio)
            img = img.resize((new_w, new_h), Image.LANCZOS)
        # Convert palette/RGBA to RGB for JPEG
        if img.mode in ('RGBA', 'P', 'LA'):
            rgb = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb.paste(img, mask=img.split()[-1] if img.mode in ('RGBA','LA') else None)
            img = rgb

        quality = 82
        img.save(dst_path, 'JPEG', quality=quality, optimize=True)
        after = os.path.getsize(dst_path)
        after_total += after
        ratio_str = f"{before/1e6:.1f}MB → {after/1e6:.1f}MB (省 {100*(1-after/before):.0f}%)"
        print(ratio_str)
    except Exception as e:
        print(f"[ERROR] {fname}: {e}")

print(f"\n{'='*50}")
print(f"處理完成：{len(files)} 張")
print(f"原始總大小：  {before_total/1e6:.1f} MB")
print(f"優化後總大小：{after_total/1e6:.1f} MB")
print(f"節省：        {(before_total-after_total)/1e6:.1f} MB ({100*(1-after_total/before_total):.1f}%)")
