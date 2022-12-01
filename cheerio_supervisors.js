const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const writeStream = fs.createWriteStream("Supervisors_CS.csv");

// Write Headers
writeStream.write(`Name,Designation,Email \n`);

request("https://cfd.nu.edu.pk/department-cs/", (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    $(".unitech-teacher").each((i, el) => {
      const t_name = $(el).find("h4 > a").text().replace(/\s\s+/g, "");
      const t_designation = $(el).find("h6").text().replace(/\s\s+/g, "");
      const t_email = $(el)
        .find("ul > li >p:nth-child(1)")
        .text()
        .replace(/,/, "");
      if (t_designation != 'Instructor') {
        console.log(
          `${t_name} is ${t_designation} at our university and you can contact at ${t_email}.`
        );
        // Write Row To CSV
        writeStream.write(`${t_name}, ${t_designation}, ${t_email} \n`);
      }
    });

    console.log("Scraping Done...");
  }
});
