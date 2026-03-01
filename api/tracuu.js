export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { keyword } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: "Thiếu keyword" });
        }

        const response = await fetch("https://c3thachban.edu.vn/index.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://c3thachban.edu.vn/index.php?language=vi&nv=tracuu"
            },
            body: new URLSearchParams({
                language: "vi",
                nv: "tracuu",
                op: "postkw",
                keywords: keyword
            })
        });

        const text = await response.text();

        const match = text.match(/OK_(\d+)/);

        if (!match) {
            return res.status(404).json({ error: "Không tìm thấy ID" });
        }

        const id = match[1];

        return res.status(200).json({
            success: true,
            id: id,
            url: `https://c3thachban.edu.vn/index.php?language=vi&nv=tracuu&op=show_kqs&id=${id}`
        });

    } catch (err) {
        return res.status(500).json({ error: "Lỗi hệ thống" });
    }
}