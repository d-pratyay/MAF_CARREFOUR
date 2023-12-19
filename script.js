document
  .getElementById("upload")
  .addEventListener("change", handleFileSelect, false);

var wrapper = document.getElementById("wrapper");

var driver = "";
var date = "";
var display = document.getElementById("displayWrapper");
var submitButton = document.getElementById("submitButton");
var starAdded = false;

document.getElementById("driver").addEventListener("change", enableButton);
document.getElementById("date").addEventListener("change", enableButton);

var parsedData = "";

var ExcelToJSON = function () {
  this.parseExcel = function (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = e.target.result;
      try {
        var workbook = XLSX.read(data, {
          type: "binary",
        });
      } catch (error) {
        submitButton.disabled = true;
        display.innerHTML = ` <p> ${error.message} </p> `;
      }

      workbook.SheetNames.forEach(function (sheetName) {
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );
        var json_object = JSON.stringify(XL_row_object);
        parsedData = JSON.parse(json_object);
      });
    };

    reader.onerror = function (ex) {
      console.log(ex);
      submitButton.disabled = true;
      display.innerHTML = ` <p> ${ex} </p> `;
    };

    reader.readAsBinaryString(file);
  };
};

function handleFileSelect(evt) {
  var files = evt.target.files;
  var xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

function enableButton() {
  driver = document.getElementById("driver").value;
  date = document.getElementById("date").value;

  if (driver.length > 0 && date.length > 0 && parsedData.length > 0) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
}

function getDetails() {
  driver = driver + "*";

  date = formatDate(date);

  if (!starAdded) {
    parsedData.forEach((item) => {
      if (item.driver) {
        item.driver = item.driver + "*";
      }
    });
    starAdded = true;
  }

  var deliveredList = parsedData.filter((item) => {
    if (item["Delivered"]) {
      return (
        item["Delivered"].includes(date) && item["driver"].includes(driver)
      );
    }
  });

  var partiallyDeliveredList = parsedData.filter((item) => {
    if (item["Partially Delivered"]) {
      return (
        item["Partially Delivered"].includes(date) &&
        item["driver"].includes(driver)
      );
    }
  });

  if (!deliveredList[0] && !partiallyDeliveredList[0]) {
    display.innerHTML = ` <p> No records found! </p> `;
    return;
  }

  var driverName = driver.replace("*", "");
  var isTrainee = false;
  var delivered = deliveredList.length;
  var partiallyDelivered = partiallyDeliveredList.length;
  var deliveryCost = 0;

  if (
    deliveredList[0].driver.toUpperCase().includes("-TR-") ||
    deliveredList[0].driver.toUpperCase().includes("-TRN-")
  ) {
    isTrainee = true;

    if (
      deliveredList[0].driver.toUpperCase().includes("-C-") ||
      deliveredList[0].driver.toUpperCase().includes("-CH-")
    ) {
      const totalDelivery = delivered + partiallyDelivered;

      if (totalDelivery <= 10) {
        deliveryCost = totalDelivery * 45;
      } else {
        deliveryCost = 450 + (totalDelivery - 10) * 55;
      }
    } else {
      const totalDelivery = delivered + partiallyDelivered;

      if (totalDelivery <= 12) {
        deliveryCost = totalDelivery * 30;
      } else {
        deliveryCost = 360 + (totalDelivery - 12) * 35;
      }
    }
  } else {
    if (
      deliveredList[0].driver.toUpperCase().includes("-C-") ||
      deliveredList[0].driver.toUpperCase().includes("-CH-")
    ) {
      const totalDelivery = delivered + partiallyDelivered;

      if (totalDelivery <= 10) {
        deliveryCost = 450;
      } else {
        deliveryCost = 450 + (totalDelivery - 10) * 55;
      }
    } else {
      const totalDelivery = delivered + partiallyDelivered;

      if (totalDelivery <= 12) {
        deliveryCost = 360;
      } else {
        deliveryCost = 360 + (totalDelivery - 12) * 35;
      }
    }
  }

  display.innerHTML = ` 
          <br>
          <hr>
          <br>
          <div class="output"><span class="output-label">Driver Name: </span><span>${driverName}</span></div>
          <div class="output"><span class="output-label">Is Trainee: </span><span>${
            isTrainee ? "Yes" : "No"
          }</span></div>
          <div class="output"><span class="output-label">Delivered: </span><span>${delivered}</span></div>
          <div class="output"><span class="output-label">Partially Delivered: </span>${partiallyDelivered}<span></span></div>
          <div class="output"><span class="output-label">Delivery Cost: </span><span>${deliveryCost}</span></div>
  `;
}

function formatDate(inputDate) {
  var date = new Date(inputDate);
  if (!isNaN(date.getTime())) {
    return (
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    );
  }
}
