import { Schema, model } from "mongoose";

const userSchema = new Schema({

  firstname: {
    type: String,
    required: [true, "first name is required"],
  },

  lastname: {
    type: String,
  },

  email: {
    type: String,
    required: [true, "email required"],
    unique: [true, "email already exists"],
  },

  password: {
    type: String,
    required: [true, "password Required"],
  },

  //  resumes uploaded by user
  resumes: [

    {

      // uploaded resume file name
      title: String,

      // cloudinary pdf url
      fileUrl: String,

      //  selected target role
      // frontend / backend / cloud / devops etc
      role: String,

      //  extracted pdf text
      parsedText: String,

      uploadedAt: {
        type: Date,
        default: Date.now,
      },

      //  AI analysis result
      analysis: {

        // ATS score
        score: Number,

        // detected skills
        skills: [String],

        // AI suggestions
        suggestions: [String],

        // missing keywords
        missingKeywords: [String],

        // matched keywords
        matchedKeywords: [String],
      }
    }
  ],
});

export const userModel = model("user", userSchema);