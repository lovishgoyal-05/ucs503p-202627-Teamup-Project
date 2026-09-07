import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

await connectDB();
const password=await bcrypt.hash("password123",12);
const user=await User.findOneAndUpdate(
  {email:"demo@teamup.local"},
  {name:"Demo Student",email:"demo@teamup.local",password,college:"Demo College",course:"Computer Science",year:"3",skills:["React","Node.js","MongoDB"],interests:["Hackathons","AI"]},
  {upsert:true,new:true}
);
await Project.findOneAndUpdate(
  {title:"AI Study Assistant"},
  {title:"AI Study Assistant",description:"Build an AI-powered assistant that helps students organize and understand their study material.",category:"AI/ML",requiredSkills:["React","Node.js","AI/ML"],creator:user._id,teamSize:4,members:[user._id]},
  {upsert:true}
);
console.log("Seed complete. Demo login: demo@teamup.local / password123");
process.exit(0);
