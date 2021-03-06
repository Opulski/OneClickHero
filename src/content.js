(() => {
  "use strict";

  const PERC = 1,
         FIX = 2;

  let checkForPaymentFinish = () => {
    let finishBtn = document.querySelector(
      '#button > input[ value="Jetzt bezahlen" ]'
    );
    if (finishBtn) {
      let donateDiv = document.createElement("div");

      donateDiv.innerHTML = `
      <div style="background-color: rgb(255, 196, 57); padding: 5px; font-weight: bold;">
        <input id="whhDoDonate" type="checkbox"/>
        Anschließend <span id="whhDonationPreview"></span> Spenden
      </div>
      <div id="content">
        <form style="display: none" id="donateFrm" action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post" target="_blank">
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value="sb-hegeo1056295@business.example.com" />
          <input type="hidden" name="item_name" value="Rettung der Welt" />
          <input type="hidden" name="currency_code" value="EUR" />
          <input type="hidden" name="amount" id="whhDonationAmount" value="0" />
        </form>
      </div><br/><br/>`;

      finishBtn.parentElement.insertBefore(donateDiv, finishBtn);
      let donationField = document.querySelector("#whhDonationAmount"),
          donationLabel = document.querySelector("#whhDonationPreview"),
              amountTag = document.querySelector("format-currency > span");


      chrome.storage.sync.get(["savingsAmount", "savingsType"], function(result) {
        var curAmnt = result.savingsAmount,
            curType = result.savingsType;


        if ( curType === PERC ) {
          // regex magic to turn "4.000,50 USD" (eg: four thousand dollar and 50 cents) into "4000.50"
          // so that parseFloat can handle it.
          let amount = parseFloat(
            amountTag.innerText.replace(/\./, "").replace(/,/, ".")
          );
          let percentage = curAmnt;
          let donation = (amount * (percentage / 100)).toFixed(2);

          donationField.value = donation;
          donationLabel.innerHTML = percentage + "% (EUR " + donation + ")";
        } else {
          var donation = 10;
          if ( curType === FIX ) {
            donation = curAmnt;
          }

          donationField.value = donation;
          donationLabel.innerHTML = "EUR " + donation.toFixed(2);
        }
      });

      finishBtn.addEventListener("click", e => {
        if (document.querySelector("#whhDoDonate").checked === true) {
          let donateForm = document.querySelector("#donateFrm");
          var w = window.open(
            "about:blank",
            "Popup_Window",
            "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=" +
              window.outerWidth +
              ",height=" +
              window.outerHeight +
              ",left=" +
              window.screenLeft +
              ",top=" +
              window.screenTop
          );
          donateForm.target = "Popup_Window";
          donateForm.submit();
          window.focus();
        }
      });
    } else {
      setTimeout(() => {
        checkForPaymentFinish();
      }, 100);
    }
  };

  let checkForDonateTo = () => {
    let donateTo = document.querySelector("#headerDonateToName");

    if (donateTo) {
      donateTo.innerText = "Deutsche Welthungerhilfe";
      // checkForDonateTo2();
    } else {
      setTimeout(() => {
        checkForDonateTo();
      }, 100);
    }
  };

  let checkForDonateTo2 = () => {
    let donateTo = document.querySelector(".vx_checkbox + p");

    if (donateTo) {
      donateTo.innerHTML = donateTo.innerHTML.replace(
        /John Doe's Test Store/,
        "die Deutsche Welthungerhilfe"
      );
      // checkForDonateTo3();
    } else {
      setTimeout(() => {
        checkForDonateTo2();
      }, 100);
    }
  };

  let checkForDonateTo3 = () => {
    let donateTo = document.querySelector(
      ".confirmation .confirmation_header >  h4"
    );

    if (donateTo) {
      chrome.storage.sync.get(["overAllDonations"], result => {
        let donationValue = parseFloat(
          donateTo.innerText
            .replace(/Sie haben ([\d\,]+).+EUR an.*/ms, "$1")
            .replace(/,/, ".")
        );
        let oldVal = result.overAllDonations || 0;

        if (!isNaN(donationValue)) {
          chrome.storage.sync.set({
            overAllDonations: oldVal + donationValue
          });
        }
      });
      donateTo.innerHTML = donateTo.innerHTML.replace(
        /John Doe's Test Store/,
        "die Deutsche Welthungerhilfe"
      );
    } else {
      setTimeout(() => {
        checkForDonateTo3();
      }, 100);
    }
  };

  let onLoad = () => {
    checkForPaymentFinish();
    checkForDonateTo();
    checkForDonateTo2();
    checkForDonateTo3();
  };

  window.addEventListener("DOMContentLoaded", onLoad);
})();
