function validateForm() {
    let fname = document.forms["regForm"]["fname"].value;
    let lname = document.forms["regForm"]["lname"].value;
    let username = document.forms["regForm"]["username"].value;
    let email = document.forms["regForm"]["email"].value;
    let phone = document.forms["regForm"]["phone"].value;
    let country = document.forms["regForm"]["country"].value;
    let password = document.forms["regForm"]["password"].value;
    if (fname == "") {
        alert("First Name must be filled out");
        return false;
    }
    if (lname == "") {
        alert("Last Name must be filled out");
        return false;
    }
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!(username.match(usernameRegex))) {
        alert("Must be valid Username");
        return false;
    }
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!(email.match(mailformat))) {
        alert("Must be valid email");
        return false;
    }
    var phonenoformat = /^(\([0-9]{3}\)\s*|[0-9]{3}\-)[0-9]{3}-[0-9]{4}$/;
    if (!(phone.match(phonenoformat))) {
        alert("Not a valid Phone Number");
        return false;
    }
    if (country == "") {
        alert("Select a valid country");
        return false;
    }
    var passwd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,20}$/;
    if (!password.match(passwd)) {
        alert("Password didn't satisfied conditions");
        return false;
    }
}