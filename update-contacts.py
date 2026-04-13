import os, re, glob

# ==========================================
# 設定新的聯絡資訊
# ==========================================
EMAIL = "owen898666@gmail.com"
LINE_URL = "https://line.me/ti/p/~owen722"
LINE_ID = "owen722"
INSTAGRAM_URL = "https://www.instagram.com/owenstylephoto/"

# ==========================================
# 1. 處理 contact.html
# ==========================================
contact_path = "contact.html"
with open(contact_path, "r", encoding="utf-8") as f:
    c = f.read()

# 更新 email
c = c.replace("owen898666@gmail.com", EMAIL)

# 更新 LINE（加連結）
c = re.sub(r'<a[^>]*href=["\'].*line.*?["\'][^>]*>.*?</a>', 
           f'<a href="{LINE_URL}" target="_blank" class="contact-line"><span class="contact-icon">💬</span> LINE：@{LINE_ID}</a>', 
           c, flags=re.IGNORECASE)
# 如果找不到舊連結，直接插入
if "line.me" not in c.lower():
    c = c.replace("owen898666@gmail.com", f"owen898666@gmail.com\n\nLINE：@{LINE_ID}（https://line.me/ti/p/~{LINE_ID}）")

# 更新 Instagram
c = re.sub(r'href=["\']https?://instagram\.com/\S+["\']', 
           f'href="{INSTAGRAM_URL}"', c, flags=re.IGNORECASE)

with open(contact_path, "w", encoding="utf-8") as f:
    f.write(c)
print(f"✓ contact.html 更新完成")

# ==========================================
# 2. 更新所有 HTML 檔案的 footer 聯絡資訊
# ==========================================
footer_replacements = {
    r'href=["\']https?://instagram\.com/\S+["\']': f'href="{INSTAGRAM_URL}"',
    r'instagram\.com/owenstylephoto': f'www.instagram.com/owenstylephoto',
    r'line\.me/ti/p/\S+': f'line.me/ti/p/~{LINE_ID}',
}

html_files = glob.glob("**/*.html", recursive=True)
print(f"\n掃描 {len(html_files)} 個 HTML 檔案...")

ig_updated = 0
line_updated = 0

for fpath in html_files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    
    # Instagram 連結更新
    if "instagram.com/owenstylephoto" in content.lower():
        content = re.sub(
            r'href=["\']https?://(?:www\.)?instagram\.com/owenstylephoto/?["\']',
            f'href="{INSTAGRAM_URL}"',
            content,
            flags=re.IGNORECASE
        )
        if content != original:
            ig_updated += 1
    
    # LINE 連結更新
    if "line.me" in content and "~" not in content:
        content = re.sub(
            r'(href=["\']https?://line\.me/ti/p/)\S+(["\'])',
            rf'\1~{LINE_ID}\2',
            content
        )
        if content != original:
            line_updated += 1
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"✓ Instagram 連結更新：{ig_updated} 個檔案")
print(f"✓ LINE 連結更新：{line_updated} 個檔案")

# ==========================================
# 3. 檢查 albums.json 裡的 email
# ==========================================
import json
with open("images/weddings/albums.json", "r", encoding="utf-8") as f:
    albums = json.load(f)

# 確保每個 album 的 photographerEmail 正確
for album in albums:
    album["photographerEmail"] = EMAIL

with open("images/weddings/albums.json", "w", encoding="utf-8") as f:
    json.dump(albums, f, ensure_ascii=False, indent=2)

print(f"\n✓ albums.json ({len(albums)} 筆) email 已更新為 {EMAIL}")
print("\n✅ 所有更新完成！")
