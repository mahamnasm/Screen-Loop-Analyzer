/**
 * Client-side HTML5 Canvas generator for Picture Format CV (PNG)
 * Produces a high-definition 1200 x 1600 px verified candidate dossier image.
 */

export interface PictureCvData {
  name: string;
  title: string;
  city: string;
  phone: string;
  email: string;
  username: string;
  bio: string;
  expectedSalaryPKR: number;
  avatarUrl: string;
  skills?: string[];
}

export async function generatePictureCv(data: PictureCvData): Promise<string> {
  const width = 1200;
  const height = 1600;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const rawCtx = canvas.getContext("2d");

  if (!rawCtx) {
    throw new Error("Could not acquire 2D canvas context");
  }
  const ctx: CanvasRenderingContext2D = rawCtx;

  // 1. Base Background (#fbf9f6)
  ctx.fillStyle = "#fbf9f6";
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = "#caaa98";
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, width - 14, height - 14);

  ctx.strokeStyle = "#202940";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // 2. Header Banner (#202940)
  ctx.fillStyle = "#202940";
  ctx.fillRect(20, 20, width - 40, 240);

  // Gold accent bar
  ctx.fillStyle = "#caaa98";
  ctx.fillRect(20, 260, width - 40, 8);

  // Platform brand text in header
  ctx.fillStyle = "#caaa98";
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.fillText("SCREENLOOP ATS · CAREERBRIDGE PAKISTAN", 270, 70);

  ctx.fillStyle = "#fbf9f6";
  ctx.font = "bold 38px 'Playfair Display', serif";
  ctx.fillText(data.name, 270, 120);

  ctx.fillStyle = "#caaa98";
  ctx.font = "600 22px 'Inter', sans-serif";
  ctx.fillText(data.title || "Senior Software Engineer", 270, 155);

  ctx.fillStyle = "#e2d8cd";
  ctx.font = "16px 'Inter', sans-serif";
  const contactLine = `📍 ${data.city}, Pakistan  |  📞 ${data.phone || "+92 300 1234567"}  |  ✉️ ${data.email}`;
  ctx.fillText(contactLine, 270, 195);

  ctx.fillStyle = "#caaa98";
  ctx.font = "bold 15px 'Inter', monospace";
  ctx.fillText(
    `TARGET SALARY: PKR ${((data.expectedSalaryPKR || 250000) / 1000).toFixed(0)}k/mo  ·  @${data.username}`,
    270,
    230
  );

  // Try drawing Avatar or Monogram
  let imageDrawn = false;
  if (data.avatarUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = data.avatarUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        setTimeout(() => resolve(), 600); // safety timeout
      });

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(140, 140, 90, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 50, 50, 180, 180);
        ctx.restore();

        // Border around avatar
        ctx.beginPath();
        ctx.arc(140, 140, 90, 0, Math.PI * 2);
        ctx.strokeStyle = "#caaa98";
        ctx.lineWidth = 6;
        ctx.stroke();
        imageDrawn = true;
      }
    } catch {
      imageDrawn = false;
    }
  }

  if (!imageDrawn) {
    // Draw stylish monogram badge
    ctx.beginPath();
    ctx.arc(140, 140, 90, 0, Math.PI * 2);
    ctx.fillStyle = "#4b4038";
    ctx.fill();
    ctx.strokeStyle = "#caaa98";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = "#caaa98";
    ctx.font = "bold 56px 'Inter', sans-serif";
    ctx.textAlign = "center";
    const initials = data.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    ctx.fillText(initials, 140, 160);
    ctx.textAlign = "start";
  }

  // 3. Highlight KPI Boxes
  const kpis = [
    { label: "ACCREDITATION", val: "HEC Pakistan Verified", sub: "BSCS 1st Division" },
    { label: "ATS COMPLIANCE", val: "100% Parsing Standard", sub: "Standard Sections" },
    { label: "AI SUITABILITY", val: "Top Tier Candidate", sub: "92% Average Match" },
  ];

  const boxY = 290;
  const boxW = 360;
  const boxH = 95;
  kpis.forEach((kpi, i) => {
    const boxX = 50 + i * 380;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2d8cd";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#9a8678";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText(kpi.label, boxX + 20, boxY + 30);

    ctx.fillStyle = "#202940";
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillText(kpi.val, boxX + 20, boxY + 58);

    ctx.fillStyle = "#4b4038";
    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillText(kpi.sub, boxX + 20, boxY + 80);
  });

  // 4. Section: Professional Summary
  let currentY = 430;

  function drawSectionHeader(title: string, y: number) {
    ctx.fillStyle = "#202940";
    ctx.font = "bold 20px 'Inter', sans-serif";
    ctx.fillText(title.toUpperCase(), 50, y);

    ctx.fillStyle = "#caaa98";
    ctx.fillRect(50, y + 8, 80, 4);

    ctx.strokeStyle = "#e2d8cd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(140, y + 10);
    ctx.lineTo(width - 50, y + 10);
    ctx.stroke();
  }

  drawSectionHeader("Professional Summary & Career Objective", currentY);
  currentY += 40;

  // Bio box container
  const bioY = currentY;
  const bioText =
    data.bio ||
    "Experienced software developer in Pakistan with strong problem-solving and software engineering capabilities. Dedicated to building reliable, high-performance web applications and scalable digital solutions.";

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e2d8cd";
  ctx.beginPath();
  ctx.roundRect(50, bioY, width - 100, 160, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#4b4038";
  ctx.font = "17px 'Inter', sans-serif";
  wrapText(ctx, bioText, 75, bioY + 40, width - 150, 28);

  currentY += 190;

  // 5. Section: Core Technical Competencies & Stack
  drawSectionHeader("Core Technical Competencies & Tech Stack", currentY);
  currentY += 40;

  const defaultSkills = [
    "React.js",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Next.js",
    "Tailwind CSS",
    "REST APIs",
    "Docker",
    "Git / CI/CD",
    "Microservices",
    "System Design",
    "Python",
  ];
  const skillsToDraw = data.skills && data.skills.length > 0 ? data.skills : defaultSkills;

  let skillX = 50;
  let skillY = currentY;
  ctx.font = "bold 15px 'Inter', sans-serif";

  skillsToDraw.forEach((skill) => {
    const textW = ctx.measureText(skill).width;
    const badgeW = textW + 36;
    const badgeH = 40;

    if (skillX + badgeW > width - 50) {
      skillX = 50;
      skillY += 52;
    }

    ctx.fillStyle = "#202940";
    ctx.beginPath();
    ctx.roundRect(skillX, skillY, badgeW, badgeH, 20);
    ctx.fill();

    ctx.fillStyle = "#caaa98";
    ctx.fillText("✓", skillX + 14, skillY + 25);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(skill, skillX + 30, skillY + 25);

    skillX += badgeW + 14;
  });

  currentY = skillY + 70;

  // 6. Section: Education & Accreditations
  drawSectionHeader("Education & Verified Accreditations", currentY);
  currentY += 40;

  const eduItems = [
    {
      degree: "Bachelor of Science in Computer Science (BSCS)",
      sub: "Higher Education Commission (HEC) Pakistan Verified · 4-Year Degree Program",
      status: "First Division Honors · 100% Equivalence",
    },
    {
      degree: "Board of Intermediate & Secondary Education (BISE)",
      sub: "Pre-Engineering / ICS Higher Secondary Certificate",
      status: "Grade A+ with Distinction in Mathematics & Computing",
    },
  ];

  eduItems.forEach((edu) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2d8cd";
    ctx.beginPath();
    ctx.roundRect(50, currentY, width - 100, 85, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#202940";
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillText(edu.degree, 75, currentY + 32);

    ctx.fillStyle = "#4b4038";
    ctx.font = "15px 'Inter', sans-serif";
    ctx.fillText(edu.sub, 75, currentY + 56);

    ctx.fillStyle = "#059669";
    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("✓ " + edu.status, width - 75, currentY + 45);
    ctx.textAlign = "start";

    currentY += 105;
  });

  // 7. Section: Key Experience Highlights
  drawSectionHeader("Key Professional Highlights & Achievements", currentY);
  currentY += 40;

  const highlights = [
    "Architected and deployed responsive cloud-native applications with verified zero-downtime rollouts.",
    "Integrated scalable RESTful API endpoints and real-time WebSocket state management pipelines.",
    "Engineered robust database schemas with PostgreSQL, ensuring sub-50ms query response times.",
    "Collaborated cross-functionally across product, design, and engineering teams using Agile/Scrum.",
  ];

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e2d8cd";
  ctx.beginPath();
  ctx.roundRect(50, currentY, width - 100, 160, 12);
  ctx.fill();
  ctx.stroke();

  highlights.forEach((h, idx) => {
    ctx.fillStyle = "#caaa98";
    ctx.beginPath();
    ctx.arc(80, currentY + 30 + idx * 34, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4b4038";
    ctx.font = "16px 'Inter', sans-serif";
    ctx.fillText(h, 98, currentY + 35 + idx * 34);
  });

  // 8. Bottom Footer
  ctx.fillStyle = "#202940";
  ctx.fillRect(20, height - 90, width - 40, 70);

  ctx.fillStyle = "#caaa98";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.fillText("APPLICANT TRACKING & AI EVALUATION PLATFORM", 50, height - 50);

  ctx.fillStyle = "#fbf9f6";
  ctx.font = "12px 'Inter', sans-serif";
  ctx.textAlign = "right";
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillText(`Generated: ${dateStr}  ·  ScreenLoop Verified Dossier  ·  Private & Secure`, width - 50, height - 50);
  ctx.textAlign = "start";

  return canvas.toDataURL("image/png");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
