import bcrypt from "bcrypt";
async function run() {
  const password = "admin123"; // choose your admin password
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}
run();
