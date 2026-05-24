
import exp from "express";

import pdfParse from "pdf-parse-fixed";

import PDFDocument from "pdfkit";

import { verifyToken } from "../middlewares/verifyToken.js";

import { upload } from "../config/multer.js";

import { uploadToCloudinary } from "../config/cloudinaryUpload.js";

import { userModel } from "../Schema/userSchema.js";

import { groq } from "../config/groq.js";

import { jobRoles } from "../Schema/roleSchema.js";

export const resumeApp = exp.Router();



// ==========================================
// Upload Resume Route
// ==========================================

resumeApp.post(

  "/upload",

  verifyToken,

  upload.single("resume"),

  async (req, res) => {

    let cloudinaryResult;

    try {

      console.log(req.body);

      console.log(req.file);



      // ==========================================
      // Check File
      // ==========================================

      if (!req.file) {

        return res.status(400).json({

          message: "No file uploaded"
        });
      }



      // ==========================================
      // Parse PDF
      // ==========================================

      const parsedData =
        await pdfParse(
          req.file.buffer
        );



      // ==========================================
      // Get Selected Role
      // ==========================================

      const role =
        req.body.role?.trim();

      console.log("ROLE:", role);



      // ==========================================
      // Validate Role
      // ==========================================

      if (!role) {

        return res.status(400).json({

          message: "Role is required"
        });
      }



      // ==========================================
      // Load Role Data
      // ==========================================

      const selectedRoleKey =
        Object.keys(jobRoles).find(

          key =>

            key.toLowerCase() ===
            role.toLowerCase()
        );

      const selectedRole =
        selectedRoleKey

          ?

          jobRoles[selectedRoleKey]

          :

          undefined;



      if (!selectedRole) {

        return res.status(400).json({

          message: "Invalid role selected"
        });
      }



      // ==========================================
      // Upload PDF To Cloudinary
      // ==========================================

      cloudinaryResult =
        await uploadToCloudinary(
          req.file.buffer
        );



      // ==========================================
      // AI Prompt
      // ==========================================

      const prompt = `

Analyze this resume for the role:

${selectedRole.title}

Job Description:
${selectedRole.description}

Required Skills:
${selectedRole.keywords.join(", ")}

Resume Content:
${parsedData.text.slice(0, 3000)}

IMPORTANT:
Return ONLY raw JSON.
Do not include markdown.
Do not write anything before or after JSON.

Return format:

{
  "score": integer between 0 and 100,
  "matchedKeywords": [],
  "missingKeywords": [],
  "suggestions": []
}

`;



      // ==========================================
      // Groq AI Call
      // ==========================================

      const completion =

        await groq.chat.completions.create({

          model: "llama-3.1-8b-instant",

          messages: [

            {
              role: "user",

              content: prompt
            }
          ],

          temperature: 0.2
        });



      // ==========================================
      // Get AI Response
      // ==========================================

      const response =

        completion
          .choices[0]
          .message
          .content;

      console.log("RAW AI RESPONSE:");

      console.log(response);



      // ==========================================
      // Clean AI Response
      // ==========================================

      let cleanedResponse =
        response

          .replace(/```json/g, "")

          .replace(/```/g, "")

          .trim();



      // ==========================================
      // Extract JSON
      // ==========================================

      const jsonMatch =
        cleanedResponse.match(
          /\{[\s\S]*\}/
        );



      if (!jsonMatch) {

        return res.status(500).json({

          message:
            "AI did not return valid JSON",

          rawResponse: response
        });
      }



      // ==========================================
      // Parse JSON
      // ==========================================

      let analysis;

      try {

        analysis =
          JSON.parse(jsonMatch[0]);

      } catch (parseError) {

        console.log(parseError);

        return res.status(500).json({

          message:
            "AI returned invalid JSON",

          rawResponse: response
        });
      }



      // ==========================================
      // Convert Decimal Score
      // ==========================================

      if (analysis.score <= 1) {

        analysis.score =

          Math.round(
            analysis.score * 100
          );
      }



      // ==========================================
      // Validate Score
      // ==========================================

      if (
        typeof analysis.score !== "number"
      ) {

        return res.status(500).json({

          message:
            "AI response missing score"
        });
      }



      // ==========================================
      // Find User
      // ==========================================

      const user =
        await userModel.findById(

          req.user.userId
        );



      if (!user) {

        return res.status(404).json({

          message: "User not found"
        });
      }



      // ==========================================
      // Save Resume
      // ==========================================

      user.resumes.push({

        title:
          req.file.originalname,

        fileUrl:
          cloudinaryResult.secure_url,

        role: role,

        parsedText:
          parsedData.text,

        analysis: {

          score:
            analysis.score,

          skills:
            analysis.matchedKeywords || [],

          suggestions:
            analysis.suggestions || [],

          missingKeywords:
            analysis.missingKeywords || [],

          matchedKeywords:
            analysis.matchedKeywords || []
        }
      });



      await user.save();

      console.log("Resume Saved");



      // ==========================================
      // Final Response
      // ==========================================

      res.status(201).json({

        message:
          "Resume uploaded and analyzed successfully",

        analysis
      });

    } catch (err) {

      console.log("UPLOAD ERROR:", err);

      res.status(500).json({

        message: err.message
      });
    }
  }
);



// ==========================================
// Resume History Route
// ==========================================

resumeApp.get(

  "/history",

  verifyToken,

  async (req, res) => {

    try {

      const user =
        await userModel.findById(
          req.user.userId
        );



      if (!user) {

        return res.status(404).json({

          message: "User not found"
        });
      }



      res.json(user.resumes);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message: err.message
      });
    }
  }
);



// ==========================================
// Download Improved Resume
// ==========================================

resumeApp.get(
  "/download/:resumeId",
  verifyToken,
  async (req, res) => {
    try {
      const user = await userModel.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // ==========================================
      // Find Resume
      // ==========================================
      const resume = user.resumes.find(
        (r) => r._id.toString() === req.params.resumeId
      );

      if (!resume) {
        return res.status(404).json({
          message: "Resume not found"
        });
      }

      // ==========================================
      // Ask Groq Llama 3 to rewrite the resume in JSON format
      // ==========================================
      let resumeData;
      try {
        const prompt = `
You are an expert resume writer and ATS optimization specialist.
Your task is to completely rewrite and optimize the following resume for the target role: "${resume.role}".
The original resume text is:
"${resume.parsedText.replace(/"/g, '\\"')}"

The AI analysis identified the following details about this resume:
- Matched Skills: ${JSON.stringify(resume.analysis.skills)}
- Missing Keywords: ${JSON.stringify(resume.analysis.missingKeywords)}
- AI Suggestions: ${JSON.stringify(resume.analysis.suggestions)}

Please rewrite and improve the resume. You MUST:
1. Incorporate the missing keywords/skills naturally into the work experience bullet points, project descriptions, and skills list.
2. Address the AI suggestions to improve the phrasing, structure, and professional impact of the resume.
3. Keep the candidate's authentic details (like their real name, contact info if present, companies worked for, and education details), but rewrite/enhance the text to sound highly professional, accomplishment-oriented, and tailored for the target role.
4. If some standard resume information is missing in the parsed text (like phone or linkedin), leave them as empty strings in the JSON or use placeholder-free values extracted from the text.
5. Return ONLY a valid JSON object in the exact format shown below. Do not include markdown code blocks, do not include any preamble or postamble.

JSON format:
{
  "name": "Candidate Full Name",
  "contact": {
    "email": "email",
    "phone": "phone number",
    "location": "city, state",
    "linkedin": "linkedin url",
    "github": "github url or portfolio link"
  },
  "summary": "A powerful 3-4 sentence professional summary tailored to the target role, highlighting key expertise and incorporating relevant keywords.",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title / Role",
      "duration": "Start Date - End Date",
      "location": "City, State",
      "highlights": [
        "Action-oriented bullet point describing a key achievement using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]) and incorporating target keywords.",
        "Another strong accomplishment bullet point..."
      ]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Detailed description of the project, including technical stack and key achievements, incorporating keywords.",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "education": [
    {
      "institution": "University/School Name",
      "degree": "Degree and Major",
      "duration": "Graduation date or attendance period"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3", "etc."]
}
`;

        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3
        });

        const responseContent = completion.choices[0].message.content;
        
        let cleanedResponse = responseContent
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          resumeData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid JSON structure returned by AI");
        }
      } catch (aiError) {
        console.error("AI Resume Rewriting Error:", aiError);
        // Fallback layout when AI fails to generate or parse
        resumeData = {
          name: user.firstname + (user.lastname ? " " + user.lastname : ""),
          contact: {
            email: user.email,
            phone: "",
            location: "",
            linkedin: "",
            github: ""
          },
          summary: `Professional optimized resume tailored for the ${resume.role} role. Auto-formatted fallback layout.`,
          experience: [
            {
              company: "Experience Section (Manual Verification Required)",
              position: resume.role,
              duration: "Present",
              location: "",
              highlights: [
                "Tailored resume elements to maximize matching ATS criteria.",
                "Original content is appended below due to AI generation fallback."
              ]
            }
          ],
          projects: [],
          education: [],
          skills: resume.analysis.skills.concat(resume.analysis.missingKeywords)
        };
      }

      // ==========================================
      // Create Professional Typeset PDF
      // ==========================================
      const doc = new PDFDocument({
        margin: 50,
        bufferPages: true
      });

      // Response Headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=improved_resume.pdf"
      );

      doc.pipe(res);

      const margin = 50;
      const contentWidth = doc.page.width - 2 * margin;

      // Colors
      const primaryColor = "#1a365d"; // Navy Blue
      const textColor = "#2d3748"; // Dark Gray
      const subtextColor = "#718096"; // Medium Gray
      const separatorColor = "#e2e8f0"; // Light Gray

      // Helper to draw section header
      const startSection = (title) => {
        if (doc.y > doc.page.height - 120) {
          doc.addPage();
        } else {
          doc.moveDown(1.2);
        }
        
        doc.fontSize(11)
           .font("Helvetica-Bold")
           .fillColor(primaryColor)
           .text(title.toUpperCase(), { characterSpacing: 1 });
        
        doc.moveDown(0.2);
        doc.moveTo(margin, doc.y)
           .lineTo(doc.page.width - margin, doc.y)
           .strokeColor(separatorColor)
           .lineWidth(1)
           .stroke();
        doc.moveDown(0.5);
      };

      // Helper to print bullet points with beautiful word wrapping
      const printBullet = (bulletText) => {
        if (doc.y > doc.page.height - 60) {
          doc.addPage();
        }
        const bulletIndent = 60;
        const textIndent = 70;
        const widthConstraint = doc.page.width - textIndent - margin;

        doc.fontSize(9.5)
           .font("Helvetica")
           .fillColor(textColor)
           .text("•", bulletIndent, doc.y, { continued: true })
           .text(bulletText, textIndent, doc.y, { width: widthConstraint, align: "justify", lineGap: 1.5 });
        doc.moveDown(0.2);
      };

      // --- 1. CONTACT HEADER ---
      doc.fillColor(primaryColor);
      doc.fontSize(22)
         .font("Helvetica-Bold")
         .text(resumeData.name || "Candidate Name", { align: "center" });

      doc.moveDown(0.25);

      const contact = resumeData.contact || {};
      const contactParts = [
        contact.email,
        contact.phone,
        contact.location,
        contact.linkedin,
        contact.github
      ].filter(Boolean);

      doc.fontSize(9)
         .font("Helvetica")
         .fillColor(textColor)
         .text(contactParts.join("   |   "), { align: "center" });

      doc.moveDown(0.5);

      // --- 2. PROFESSIONAL SUMMARY ---
      if (resumeData.summary) {
        startSection("Professional Summary");
        doc.fontSize(9.5)
           .font("Helvetica")
           .fillColor(textColor)
           .text(resumeData.summary, { align: "justify", lineGap: 2 });
      }

      // --- 3. WORK EXPERIENCE ---
      if (resumeData.experience && resumeData.experience.length > 0) {
        startSection("Work Experience");
        resumeData.experience.forEach((exp, idx) => {
          if (idx > 0) doc.moveDown(0.6);

          if (doc.y > doc.page.height - 80) {
            doc.addPage();
          }

          const yBefore = doc.y;
          // Job Title & Company
          doc.fontSize(10)
             .font("Helvetica-Bold")
             .fillColor(textColor)
             .text(exp.position || "Job Title", margin, yBefore, { continued: true })
             .font("Helvetica")
             .text(` at ${exp.company || "Company"}`, { continued: false });

          // Right-aligned Duration
          const durationText = exp.duration || "";
          const durationWidth = doc.widthOfString(durationText);
          const rightX = doc.page.width - margin - durationWidth;

          doc.fontSize(9)
             .font("Helvetica-Oblique")
             .fillColor(subtextColor)
             .text(durationText, rightX, yBefore, { align: "right" });

          // Location
          if (exp.location) {
            doc.fontSize(8.5)
               .font("Helvetica")
               .fillColor(subtextColor)
               .text(exp.location, margin);
          }

          doc.moveDown(0.2);

          // Highlights Bullet Points
          if (exp.highlights && exp.highlights.length > 0) {
            exp.highlights.forEach(bullet => {
              printBullet(bullet);
            });
          }
        });
      }

      // --- 4. KEY PROJECTS ---
      if (resumeData.projects && resumeData.projects.length > 0) {
        startSection("Key Projects");
        resumeData.projects.forEach((proj, idx) => {
          if (idx > 0) doc.moveDown(0.6);

          if (doc.y > doc.page.height - 60) {
            doc.addPage();
          }

          const yBefore = doc.y;
          doc.fontSize(10)
             .font("Helvetica-Bold")
             .fillColor(textColor)
             .text(proj.title || "Project Title", margin, yBefore, { continued: true });

          if (proj.technologies && proj.technologies.length > 0) {
            doc.font("Helvetica")
               .fillColor(subtextColor)
               .text(` (${proj.technologies.join(", ")})`, { continued: false });
          } else {
            doc.text("", { continued: false });
          }

          doc.moveDown(0.2);

          if (proj.description) {
            printBullet(proj.description);
          }
        });
      }

      // --- 5. EDUCATION ---
      if (resumeData.education && resumeData.education.length > 0) {
        startSection("Education");
        resumeData.education.forEach((edu, idx) => {
          if (idx > 0) doc.moveDown(0.5);

          if (doc.y > doc.page.height - 50) {
            doc.addPage();
          }

          const yBefore = doc.y;
          doc.fontSize(10)
             .font("Helvetica-Bold")
             .fillColor(textColor)
             .text(edu.degree || "Degree", margin, yBefore, { continued: true })
             .font("Helvetica")
             .text(` - ${edu.institution || "Institution"}`, { continued: false });

          const durationText = edu.duration || "";
          const durationWidth = doc.widthOfString(durationText);
          const rightX = doc.page.width - margin - durationWidth;

          doc.fontSize(9)
             .font("Helvetica-Oblique")
             .fillColor(subtextColor)
             .text(durationText, rightX, yBefore, { align: "right" });
        });
      }

      // --- 6. TECHNICAL SKILLS ---
      if (resumeData.skills && resumeData.skills.length > 0) {
        startSection("Technical Skills");
        doc.fontSize(9.5)
           .font("Helvetica")
           .fillColor(textColor)
           .text(resumeData.skills.join(", "), margin, doc.y, { width: contentWidth, align: "justify", lineGap: 2 });
      }

      // Append Original content if we fell back
      if (resumeData.summary && resumeData.summary.includes("Fallback")) {
        startSection("Original Resume Parsed Text");
        doc.fontSize(9)
           .font("Helvetica")
           .fillColor(textColor)
           .text(resume.parsedText.slice(0, 3000), { align: "justify", lineGap: 1.5 });
      }

      // ==========================================
      // Add Page Numbers to Footers
      // ==========================================
      let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        if (pages.count > 1) {
          doc.fontSize(8)
             .fillColor("#718096")
             .text(
               `Page ${i + 1} of ${pages.count}`,
               50,
               doc.page.height - 40,
               { align: "center" }
             );
        }
      }

      doc.end();
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: err.message
      });
    }
  }
);



// ==========================================
// Delete All Resumes
// ==========================================

resumeApp.delete(

  "/",

  verifyToken,

  async (req, res) => {

    try {

      const user =
        await userModel.findById(
          req.user.userId
        );



      if (!user) {

        return res.status(404).json({

          message: "User not found"
        });
      }



      user.resumes = [];

      await user.save();



      res.json({

        message:
          "All resumes deleted"
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message: err.message
      });
    }
  }
);



// ==========================================
// Delete Particular Resume
// ==========================================

resumeApp.delete(

  "/:resumeId",

  verifyToken,

  async (req, res) => {

    try {

      const user =
        await userModel.findById(
          req.user.userId
        );



      if (!user) {

        return res.status(404).json({

          message: "User not found"
        });
      }



      user.resumes =

        user.resumes.filter(

          (resume) =>

            resume._id.toString() !==
            req.params.resumeId
        );



      await user.save();



      res.json({

        message:
          "Resume deleted successfully"
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message: err.message
      });
    }
  }
);
