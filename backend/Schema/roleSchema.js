// Schema/roleSchema.js

import { Skills } from "openai/resources/index.mjs";

export const jobRoles = {

  frontend: {

    title: "Frontend Developer",

    description:
      "Frontend developers build responsive user interfaces and client-side applications.",

    keywords: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Redux",
      "Tailwind CSS",
      "Bootstrap",
      "REST API",
      "Responsive Design",
      "Git",
      "GitHub"
    ]
  },



  backend: {

    title: "Backend Developer",

    description:
      "Backend developers build APIs, databases, authentication systems, and server-side logic.",

    keywords: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "SQL",
      "JWT",
      "REST API",
      "Authentication",
      "Authorization",
      "Mongoose",
      "Git",
      "Postman"
    ]
  },



  fullstack: {

    title: "Full Stack Developer",

    description:
      "Full stack developers work on both frontend and backend systems.",

    keywords: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "JavaScript",
      "REST API",
      "JWT",
      "HTML",
      "CSS",
      "Git",
      "GitHub"
    ]
  },



  cloud: {

    title: "Cloud Engineer",

    description:
      "Cloud engineers manage cloud infrastructure, deployments, scalability, and cloud services.",

    keywords: [
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Linux",
      "Cloud Security",
      "Terraform",
      "CI/CD",
      "Networking",
      "Load Balancing"
    ]
  },



  devops: {

    title: "DevOps Engineer",

    description:
      "DevOps engineers automate deployment pipelines, infrastructure, monitoring, and system reliability.",

    keywords: [
      "Docker",
      "Kubernetes",
      "Jenkins",
      "GitHub Actions",
      "CI/CD",
      "AWS",
      "Linux",
      "Terraform",
      "Monitoring",
      "Prometheus",
      "Grafana",
      "Shell Scripting"
    ]
  },



  aiEngineer: {

    title: "AI Engineer",

    description:
      "AI engineers build machine learning systems, deep learning models, and AI-powered applications.",

    keywords: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "NLP",
      "LLM",
      "Data Science",
      "Pandas",
      "NumPy",
      "Scikit-learn"
    ]
  },



  dataScientist: {

    title: "Data Scientist",

    description:
      "Data scientists analyze data, build predictive models, and generate business insights.",

    keywords: [
      "Python",
      "Pandas",
      "NumPy",
      "Data Analysis",
      "Machine Learning",
      "Statistics",
      "Data Visualization",
      "SQL",
      "Power BI",
      "Tableau"
    ]
  },



  cybersecurity: {

    title: "Cybersecurity Engineer",

    description:
      "Cybersecurity engineers secure systems, detect threats, and protect applications and networks.",

    keywords: [
      "Network Security",
      "Penetration Testing",
      "OWASP",
      "Linux",
      "Firewalls",
      "SIEM",
      "Cryptography",
      "Ethical Hacking",
      "Incident Response",
      "Security Auditing"
    ]
  },

   HR:
  {
    Title:"human resources",

    description:"manages the employess",

    keywords:[
      "communication",
      "mass communication",
      "public speaking",
      "motivating",



    ]

  }

};