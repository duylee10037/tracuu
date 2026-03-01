export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { keyword } = req.body;

  if (!keyword) {
    return res.json({ success: false, error: "Thiếu từ khóa" });
  }

  try {
    // 🔹 POST tìm ID
    const postResponse = await fetch(
      "https://c3thachban.edu.vn/index.php?language=vi&nv=tracuu&op=postkw",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0",
          "Referer":
            "https://c3thachban.edu.vn/index.php?language=vi&nv=tracuu"
        },
        body:
          "language=vi&nv=tracuu&op=postkw&keywords=" +
          encodeURIComponent(keyword)
      }
    );

    const postText = await postResponse.text();

    // 🔹 Nếu có OK_xxxx (1 người)
    if (postText.includes("OK_")) {
      const id = postText.split("OK_")[1].trim();
      return await sendDetail(id, res);
    }

    // 🔹 Nếu trùng tên → có nhiều id trong HTML
    const idMatches = [...postText.matchAll(/id=(\d+)/g)];

    if (idMatches.length > 0) {
      const list = idMatches.map(m => m[1]);

      return res.json({
        success: true,
        multiple: true,
        list
      });
    }

    return res.json({
      success: false,
      error: "Không tìm thấy kết quả"
    });

  } catch (err) {
    return res.json({ success: false, error: "Lỗi hệ thống" });
  }
}

// 🔹 Hàm lấy chi tiết
async function sendDetail(id, res) {

  const detailResponse = await fetch(
    `https://c3thachban.edu.vn/index.php?language=vi&nv=tracuu&op=show_kqs&id=${id}`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );

  const html = await detailResponse.text();

  const name = html.match(/Họ và tên:.*?>(.*?)</i)?.[1] || "";
  const sbd = html.match(/Số báo danh:\s*(\d+)/i)?.[1] || "";
  const lop = html.match(/Học sinh lớp:\s*(.*?)</i)?.[1] || "";
  const ngaysinh = html.match(/Ngày sinh:\s*(.*?)</i)?.[1] || "";

  const phongMatch = html.match(/<td>\s*(\d+)\s*<\/td>\s*<td>\s*(\d+)/);

  const phong = phongMatch?.[1] || "";
  const stt = phongMatch?.[2] || "";

  return res.json({
    success: true,
    multiple: false,
    data: {
      name,
      sbd,
      lop,
      ngaysinh,
      phong,
      stt
    }
  });
}
