document
  .getElementById("upload")
  .addEventListener("change", handleFileSelect, false);

var parsedData = "";

var ExcelToJSON = function () {
  this.parseExcel = function (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });
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
    };

    reader.readAsBinaryString(file);
  };
};



function handleFileSelect(evt) {
  var files = evt.target.files;
  var xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

function appendStar(){
    
}

function getDetails() {
  //   console.log(parsedData);
  var driver = document.getElementById("driver").value;
  var date = document.getElementById("date").value;
  var display = document.getElementById("display");
  driver = driver + "*";

  date = formatDate(date);

  parsedData.forEach((item) => {
    if (item.driver) {
      item.driver = item.driver + "*";
    }
  });

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

  display.innerText = ` 
  Driver Name: ${driverName} \n
  isTrainee: ${isTrainee} \n
  Delivered : ${delivered} \n 
  Partially Delivered : ${partiallyDelivered} \n
  Delivery Cost: ${deliveryCost} \n
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
