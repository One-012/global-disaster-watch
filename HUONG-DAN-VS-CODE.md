# GLOBAL DISASTER WATCH — Hướng dẫn VS Code

## 1. Lựa chọn công nghệ

Ngôn ngữ chính: **TypeScript**. Framework: **Next.js App Router + React**. Giao diện: CSS thuần có biến màu, responsive. Bản đồ: Leaflet + OpenStreetMap. Dữ liệu video: YouTube Data API v3, gọi ở phía máy chủ.

TypeScript là JavaScript có kiểu dữ liệu. React xây giao diện; Next.js quản lý trang, render phía server và metadata SEO. Đây là lựa chọn phù hợp cho website tin tức kết hợp kênh YouTube có nhiều trang báo cáo. Không có một ngôn ngữ tối ưu tuyệt đối cho mọi website; một trang giới thiệu đơn giản có thể chỉ cần HTML/CSS/JavaScript.

Bộ nguồn đã có trang chủ, trang chi tiết báo cáo, bản đồ có nút chọn vùng, khối video nổi bật, video mới, trạng thái khi chưa cấu hình/API lỗi, trang 404 và giao diện điện thoại. Không có CMS, đăng nhập quản trị, hệ thống cảnh báo thời tiết trực tiếp hay cơ sở dữ liệu. Nội dung chỉnh bằng file. Chưa triển khai lên Internet.

## 2. Cài đặt máy Windows

1. Cài VS Code: https://code.visualstudio.com/
2. Cài Node.js bản LTS còn được hỗ trợ từ https://nodejs.org/ — khuyến nghị Node.js 24 LTS; Next.js yêu cầu tối thiểu 20.9.
3. Đóng và mở lại VS Code sau khi cài Node.js.
4. Giải nén ZIP. Mở **File → Open Folder**, chọn thư mục `global-disaster-watch` chứa `package.json`.
5. Mở **Terminal → New Terminal**. Nếu PowerShell chặn script `npm.ps1`, chọn **Command Prompt** từ menu terminal hoặc dùng `npm.cmd` thay `npm`.
6. Kiểm tra:

```bash
node -v
npm -v
```

7. Cài thư viện theo lockfile đi kèm:

```bash
npm ci
```

Nếu không có `package-lock.json`, chạy `npm install` lần đầu; sau đó giữ lại lockfile.

8. Chạy website:

```bash
npm run dev
```

9. Mở http://localhost:3000 trong trình duyệt. Nếu cổng 3000 đang bận, dùng địa chỉ terminal in ra. Giữ terminal hoạt động; nhấn Ctrl+C để dừng.
10. Thử sửa một tiêu đề trong `app/page.tsx`, nhấn Ctrl+S. Trình duyệt cập nhật tự động.

Không mở trực tiếp file TSX bằng trình duyệt và không dùng extension Live Server cho dự án Next.js này.

## 3. Các file và trách nhiệm

| File | Chức năng | Khi nào sửa |
|---|---|---|
| `package.json` | Thư viện, lệnh chạy | Thêm dependency/lệnh |
| `package-lock.json` | Phiên bản thư viện đã khóa | npm tự cập nhật |
| `tsconfig.json` | TypeScript và alias `@/` | Thường không cần sửa |
| `next-env.d.ts` | Kiểu Next.js | Không sửa thủ công |
| `.env.example` | Mẫu cấu hình riêng | Sao chép thành `.env.local` |
| `.gitignore` | Loại key, cache, node_modules khỏi Git | Thường không cần sửa |
| `app/layout.tsx` | Header/footer dùng chung, SEO | Title/description toàn website |
| `app/page.tsx` | Trang chủ | Bố cục, hero, section |
| `app/globals.css` | Màu, font, khoảng cách, responsive | Đổi phong cách |
| `app/reports/[slug]/page.tsx` | Trang chi tiết bài viết | Bố cục bài báo |
| `app/not-found.tsx` | Trang 404 | Nội dung khi URL không tồn tại |
| `app/error.tsx` | Giao diện lỗi | Nội dung và nút thử lại |
| `components/Header.tsx` | Logo chữ, menu, YouTube | Điều hướng |
| `components/Footer.tsx` | Giới thiệu, attribution, thông báo tư liệu | Footer/liên hệ |
| `components/VideoGrid.tsx` | Danh sách video | Card video |
| `components/Coverage.tsx` | Leaflet, marker, chọn khu vực | Bản đồ |
| `lib/site.ts` | Tên, mô tả, URL kênh, email | Thông tin thương hiệu |
| `lib/reports.ts` | Danh sách bài và tọa độ | Đăng/sửa báo cáo |
| `lib/youtube.ts` | API YouTube phía server | Đồng bộ video |
| `public/images/storm.jpg` | Ảnh hero thật, lưu sẵn | Thay ảnh có quyền sử dụng |
| `ASSET-CREDITS.md` | Nguồn và giấy phép ảnh | Cập nhật khi thay ảnh |

`node_modules` và `.next` được tạo tự động. Không gửi hai thư mục này khi chia sẻ source.

## 4. Đổi thương hiệu và liên kết kênh

Mở `lib/site.ts`. Tên đã là GLOBAL DISASTER WATCH. Điền URL kênh thật vào `youtubeUrl`, email vào `email`. Khi để trống, nút YouTube và liên hệ được ẩn để tránh dẫn đến kênh/địa chỉ không đúng.

Ví dụ cấu trúc (hãy thay giá trị bằng của bạn):

```ts
youtubeUrl: "https://www.youtube.com/@YOUR_REAL_HANDLE",
email: "YOUR_REAL_EMAIL",
```

Giao diện mặc định bằng tiếng Anh cho khán giả quốc tế. Nếu đổi sang tiếng Việt, sửa nội dung trong các component và đổi `lang="en"` thành `lang="vi"` trong `app/layout.tsx`.

## 5. Đồng bộ video YouTube

Website chạy được ngay cả khi chưa có API key. Chưa cấu hình thì hiển thị trạng thái chờ rõ ràng, không có video giả hoặc số lượt xem giả.

1. Truy cập https://console.cloud.google.com/ và tạo/chọn project.
2. Bật **YouTube Data API v3** cho project.
3. Tạo API key. Giới hạn key cho YouTube Data API v3. Vì request chạy phía server, không cấu hình giới hạn HTTP referrer dành cho browser; dùng kiểu giới hạn phù hợp với hạ tầng server của bạn.
4. Lấy Channel ID của kênh (chuỗi bắt đầu bằng UC), không dùng @handle thay cho ID. Xem phần cài đặt nâng cao tài khoản YouTube của kênh.
5. Sao chép `.env.example` thành `.env.local` ở cùng cấp `package.json`. Có thể làm trong Explorer của VS Code hoặc Command Prompt:

```bat
copy .env.example .env.local
```

6. Điền:

```dotenv
YOUTUBE_API_KEY=YOUR_REAL_API_KEY
YOUTUBE_CHANNEL_ID=YOUR_REAL_UC_CHANNEL_ID
YOUTUBE_FEATURED_PLAYLIST_ID=YOUR_PUBLIC_FEATURED_PLAYLIST_ID
SITE_URL=http://localhost:3000
```

7. Tạo playlist công khai chứa các video nổi bật trên kênh. Lấy mã sau `list=` trong URL playlist, điền vào `YOUTUBE_FEATURED_PLAYLIST_ID`. Không bắt buộc; bỏ trống thì khối nổi bật giữ trạng thái chờ. Thứ tự khối nổi bật theo playlist, không tự xếp theo lượt xem.
8. Khởi động lại `npm run dev` sau khi sửa `.env.local`.

Cách hoạt động: server dùng `channels.list` lấy uploads playlist, rồi `playlistItems.list` lấy 6 video gần nhất. Khối nổi bật lấy 3 video đầu playlist cấu hình. Cache 15 phút; không phải push thời gian thực. Refresh cache phụ thuộc request, nên không hứa cập nhật đúng từng giây. Video mở trên YouTube khi bấm, không nhúng player theo dõi vào trang.

Không đặt key trong `NEXT_PUBLIC_*`, `lib/site.ts`, frontend hoặc Git. `.env.local` đã nằm trong `.gitignore`. YouTube có quota; theo dõi quota trong Google Cloud. Khi API lỗi/timeout, trang vẫn hoạt động và hiện thông báo phù hợp, không lộ key/lỗi nội bộ.

## 6. Thêm báo cáo và vị trí bản đồ

Mở `lib/reports.ts`. Mỗi object là một bài và một vùng trên bản đồ. Sao chép một object hiện có rồi thay:

```ts
{
  slug: "unique-story-slug",
  category: "Severe storms",
  region: "Your reporting region",
  title: "Your verified headline",
  summary: "Your short summary.",
  coordinates: [35.5, -97.5], // [vĩ độ, kinh độ]
  source: "https://www.weather.gov/",
  sourceName: "National Weather Service",
  paragraphs: ["First paragraph.", "Second paragraph."]
}
```

`slug` phải duy nhất, không dấu, dùng dấu gạch ngang. URL bài là `/reports/unique-story-slug`. Tọa độ là tâm vùng đưa tin, không tự động là tọa độ thảm họa. Bấm vùng/marker để chuyển nội dung; danh sách cũng dùng được với bàn phím.

Bộ nguồn hiện cố ý ghi SAMPLE/PREVIEW và không cho index trang bài mẫu. Khi có bài thật, thay toàn bộ nội dung mẫu, thêm ngày sự kiện/ngày cập nhật, URL nguồn cụ thể, quyền ảnh và sửa nhãn trong `app/page.tsx`, `components/Coverage.tsx`, `app/reports/[slug]/page.tsx`. Chỉ bỏ `robots: {index: false, follow: true}` ở trang báo cáo khi đã sẵn sàng index bài thật. Chưa có schema NewsArticle hoặc sitemap tự động; bổ sung khi có dữ liệu xuất bản thật.

## 7. Phong cách thiết kế

- Nền charcoal `#101214`, panel `#191c20`, đỏ `#ed493e`.
- Barlow Condensed cho headline: cảm giác newsroom/cinematic.
- DM Sans cho đoạn văn và điều hướng: dễ đọc.
- Hero ảnh lớn và lớp tối để chữ đọc rõ; không intro che trang.
- Các đường phân cột, số mục và khoảng trắng tạo nhịp báo chí.
- Nội dung chính 16px+, menu 14px; responsive điện thoại.
- Tôn trọng reduced motion. Có skip link và trạng thái focus.

Đổi màu ở `:root` đầu `app/globals.css`. Font tải từ Google Fonts; offline dùng font dự phòng. Nếu cần tự host font, tải font đúng giấy phép vào `public/fonts/` và thay @import bằng @font-face.

Thay hero bằng ảnh bạn có quyền dùng, giữ tên `public/images/storm.jpg` hoặc sửa đường dẫn trong `app/page.tsx`. Cập nhật alt, caption, footer và ASSET-CREDITS. Không dùng ảnh minh họa như bằng chứng cho một thảm họa đang xảy ra.

Bản đồ cần Internet và giữ attribution OpenStreetMap. Tile server công cộng phù hợp bản thử nghiệm/traffic nhỏ, không có SLA; trước khi có traffic lớn chọn nhà cung cấp tile theo chính sách của họ. Nếu tile lỗi, danh sách bài vẫn dùng được.

## 8. Kiểm tra trước khi chạy production

```bash
npm run typecheck
npm run build
npm start
```

Mở localhost và thử: menu từng section; cả 3 báo cáo; URL không tồn tại; nút vùng/marker trên bản đồ; mobile 390px; zoom chữ 200%; tab bằng bàn phím. Khi có key thật, kiểm tra video đúng kênh và playlist. Thử tắt Internet để kiểm tra font dự phòng/trạng thái bản đồ.

## 9. Đưa lên Vercel khi bạn sẵn sàng

Không có bước triển khai tự động trong bộ ZIP.

1. Tạo repository GitHub và đưa source lên, tuyệt đối không đưa `.env.local`, `node_modules`, `.next`.
2. Vercel → Add New Project → Import repository.
3. Framework Preset: Next.js. Root Directory là thư mục chứa `package.json`.
4. Thêm các biến môi trường giống `.env.local` trong phần Environment Variables.
5. Đổi SITE_URL thành domain HTTPS thật. Điền đúng URL kênh và thay nội dung mẫu trước khi công khai.
6. Deploy. Nếu sửa biến môi trường sau này, redeploy.

Có thể tự host trên Node.js bằng `npm run build` rồi `npm start`; cần process manager, HTTPS và reverse proxy khi vận hành thật. Đây không phải static export: đồng bộ YouTube cần server.

## 10. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `npm` không được nhận diện | Cài Node.js, mở lại terminal |
| PowerShell chặn npm.ps1 | Chọn Command Prompt hoặc `npm.cmd` |
| Không tìm thấy package.json | Mở đúng thư mục sau giải nén |
| API chưa hiện video | Kiểm tra Channel ID, key, API enabled, quota; restart server |
| Nổi bật trống nhưng mới nhất có video | Thêm public Featured Playlist ID |
| Đã đổi video nhưng chưa cập nhật | Cache 15 phút; không phải live sync |
| Ảnh không hiển thị | Kiểm tra `public/images/storm.jpg`, phân biệt chữ hoa/thường |
| Bản đồ trống | Kiểm tra Internet/tile server; danh sách vẫn dùng được |
| Chạy Live Server không được | Dùng `npm run dev`, không mở file TSX trực tiếp |

## 11. Tài liệu chính thức

- Next.js: https://nextjs.org/docs/app/getting-started/installation
- YouTube API: https://developers.google.com/youtube/v3/docs
- Uploads playlist: https://developers.google.com/youtube/v3/guides/implementation/playlists
- Leaflet: https://leafletjs.com/reference.html
- OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/

Xem `VALIDATION.md` để biết chính xác các kiểm tra đã thực hiện trong môi trường tạo bộ nguồn.
