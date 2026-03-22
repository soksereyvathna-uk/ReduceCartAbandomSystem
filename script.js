/*
 * script.js
 * OneStop Smart Checkout - JavaScript Logic
 *
 * Purpose:
 *   Handles all interactive behaviour for the OneStop Smart Checkout page.
 *   This includes pricing calculations, discount code validation, form
 *   submission handling, guest checkout, and a cart abandonment popup
 *   triggered by user inactivity.
 *
 * Structure:
 *   1.  Pricing State Variables
 *   2.  updatePriceUI()         - Refreshes the displayed price in the DOM
 *   3.  applyDiscountLogic()    - Shared discount application logic
 *   4.  applyDiscount()         - Handles manual discount code entry
 *   5.  applyPopupDiscount()    - Handles discount applied via the popup
 *   6.  Form Submit Event       - Handles checkout form submission
 *   7.  guestCheckout()         - Handles guest checkout action
 *   8.  Cart Abandonment Timer  - Inactivity detection and popup control
 *   9.  closePopup()            - Hides the cart abandonment popup
 */


/* ============================================================
   1. PRICING STATE VARIABLES
   These variables maintain the current state of the cart
   pricing throughout the user's session on the page.
   
   - originalTotal : The base cart total before any discount.
                     Stored separately so the original price
                     can always be displayed and referenced.
   - total         : The working total shown to the user.
                     Updated when a discount is applied.
   - discountUsed  : A boolean flag that prevents a discount
                     from being applied more than once per session.
============================================================ */
let originalTotal = 80;   // Base cart total in USD ($50 headphones + $30 T-shirt)
let total = 80;           // Current total; initialised equal to originalTotal
let discountUsed = false; // Tracks whether a discount has already been applied


/* ============================================================
   2. updatePriceUI()
   
   Purpose:
     Dynamically updates the price display box (id="priceBox")
     in the DOM to reflect the current state of the pricing
     variables. Called after any discount is successfully applied.
   
   Behaviour:
     - Selects the priceBox element by its ID.
     - Injects HTML containing:
         * The original price with a strikethrough (class="original")
         * The discounted total in bold purple (class="discounted")
     - Uses toFixed(2) on total to ensure two decimal places
       are always shown (e.g., 72.00 rather than 72).
   
   Parameters : None
   Returns    : void
============================================================ */
function updatePriceUI() {
  // Retrieve the price display container element from the DOM
  const priceBox = document.getElementById("priceBox");

  // Rebuild the inner HTML of the price box with updated values
  // The original price is displayed with a strikethrough to indicate it has changed
  // The discounted total is shown prominently below it
  priceBox.innerHTML = `
    <div class="original">Original: $${originalTotal}</div>
    <div class="discounted">Total: $${total.toFixed(2)}</div>
  `;
}


/* ============================================================
   3. applyDiscountLogic(source)
   
   Purpose:
     Centralised function that applies the 10% discount to the
     cart total. Used by both the manual code entry path and
     the popup button path to avoid code duplication.
   
   Parameters:
     source {string} - Identifies which UI element triggered
                       the discount. Accepted values:
                         "manual" - triggered by the discount input field
                         "popup"  - triggered by the cart abandonment popup
   
   Behaviour:
     1. Checks the discountUsed flag; if a discount has already
        been applied, sets a warning status message and exits early.
     2. Calculates a 10% reduction: total = originalTotal * 0.9
     3. Sets discountUsed to true to prevent further discounts.
     4. Calls updatePriceUI() to reflect the new total in the DOM.
     5. Updates the status message to confirm the discount source.
   
   Returns : void
============================================================ */
function applyDiscountLogic(source) {

  // Guard clause: prevent applying more than one discount per session
  if (discountUsed) {
    document.getElementById("status").innerText = "⚠️ Discount already applied";
    return; // Exit the function early; no further changes made
  }

  // Apply a 10% discount to the original total (multiply by 0.9 = 90% of original)
  total = originalTotal * 0.9;

  // Set the flag to true so this discount cannot be applied again
  discountUsed = true;

  // Refresh the price display in the DOM to show the new discounted total
  updatePriceUI();

  // Display an appropriate confirmation message based on which trigger was used
  // Ternary operator selects the message string based on the source parameter
  document.getElementById("status").innerText =
    source === "popup"
      ? "🎉 10% discount applied from reminder"  // Message shown when popup button was used
      : "✅ Discount code applied";               // Message shown when manual code was used
}


/* ============================================================
   4. applyDiscount()
   
   Purpose:
     Validates the discount code entered by the user in the
     text input field (id="discount") and applies the discount
     if the code is correct.
   
   Behaviour:
     - Reads the current value of the discount input field.
     - Compares the value against the valid code "SAVE10".
     - If valid  : calls applyDiscountLogic("manual") to apply the discount.
     - If invalid: displays an error message in the status area.
   
   Called by : onclick="applyDiscount()" on the Apply Discount button in index.html
   Parameters : None
   Returns    : void
============================================================ */
function applyDiscount() {
  // Read the value currently entered in the discount code input field
  const code = document.getElementById("discount").value;

  // Validate the code against the accepted discount string
  if (code === "SAVE10") {
    // Valid code: apply the discount through the shared logic function
    applyDiscountLogic("manual");
  } else {
    // Invalid code: inform the user without making any changes to the total
    document.getElementById("status").innerText = "❌ Invalid code";
  }
}


/* ============================================================
   5. applyPopupDiscount()
   
   Purpose:
     Applies the 10% discount when the user clicks the action
     button inside the cart abandonment popup, then closes
     the popup so it no longer obstructs the page.
   
   Behaviour:
     - Calls applyDiscountLogic("popup") to apply the discount
       with the appropriate confirmation message.
     - Calls closePopup() to hide the popup element.
   
   Called by : onclick="applyPopupDiscount()" on the popup button in index.html
   Parameters : None
   Returns    : void
============================================================ */
function applyPopupDiscount() {
  applyDiscountLogic("popup"); // Apply discount and update status message for popup source
  closePopup();                // Dismiss the popup after the discount has been applied
}


/* ============================================================
   6. FORM SUBMIT EVENT LISTENER
   
   Purpose:
     Intercepts the default HTML form submission behaviour to
     prevent a full page reload, and instead displays an inline
     success confirmation message to the user.
   
   Behaviour:
     - Listens for the "submit" event on the form element (id="form").
     - e.preventDefault() stops the browser's default form POST/GET action.
     - Makes the success message element (id="success") visible.
   
   Note:
     In a production environment, this handler would also collect
     the form data and send it to a backend server via fetch() or
     XMLHttpRequest for order processing.
============================================================ */
document.getElementById("form").addEventListener("submit", function(e) {
  e.preventDefault(); // Prevent the default form submission (page reload or redirect)

  // Show the success confirmation message that is hidden by default in CSS
  document.getElementById("success").style.display = "block";
});


/* ============================================================
   7. guestCheckout()
   
   Purpose:
     Provides a simplified checkout path for users who do not
     wish to create an account or provide full details.
   
   Behaviour:
     - Displays a browser alert dialog to confirm that guest
       checkout mode has been activated.
   
   Note:
     In a production implementation, this would redirect the
     user to a guest checkout flow with reduced required fields.
   
   Called by : onclick="guestCheckout()" on the Guest Checkout button in index.html
   Parameters : None
   Returns    : void
============================================================ */
function guestCheckout() {
  alert("🛒 Guest checkout activated!"); // Temporary placeholder for guest checkout logic
}


/* ============================================================
   8. CART ABANDONMENT TIMER
   
   Purpose:
     Detects user inactivity and displays a promotional popup
     after 8 seconds of no mouse movement or keyboard input.
     This is a common e-commerce retention technique intended
     to reduce cart abandonment rates.
   
   Variables:
     timer {number} - Stores the ID of the active setTimeout,
                      allowing it to be cancelled and restarted.
   
   Functions:
     startTimer() - Initiates an 8-second countdown. When it
                    expires, the popup's "hidden" class is removed,
                    making it visible to the user.
   
     resetTimer() - Cancels the current countdown and immediately
                    starts a new one. Called on every mouse movement
                    or keypress to ensure the popup only appears after
                    a genuine period of inactivity.
   
   Event Bindings:
     window.onload          - Starts the inactivity timer as soon as
                              the page finishes loading.
     document.onmousemove   - Resets the timer on every mouse movement.
     document.onkeypress    - Resets the timer on every keypress.
   
   Note:
     Using onmousemove and onkeypress as singular event handler
     properties means only one handler can be assigned to each at
     a time. In a production setting, addEventListener would be
     preferred to allow multiple handlers.
============================================================ */
let timer; // Holds the reference ID for the active inactivity timeout

/**
 * startTimer
 * Starts an 8-second (8000 ms) timeout countdown.
 * When the countdown completes without interruption,
 * the popup element's "hidden" class is removed to display it.
 */
function startTimer() {
  timer = setTimeout(() => {
    // After 8 seconds of inactivity, remove "hidden" to reveal the popup
    document.getElementById("popup").classList.remove("hidden");
  }, 8000); // Timeout duration: 8000 milliseconds = 8 seconds
}

/**
 * resetTimer
 * Cancels the currently running timeout and restarts it from zero.
 * This ensures the popup only appears after 8 consecutive seconds
 * of genuine inactivity (no mouse or keyboard events).
 */
function resetTimer() {
  clearTimeout(timer); // Cancel the existing countdown to prevent early popup display
  startTimer();        // Begin a fresh 8-second countdown from zero
}

// Start the inactivity timer as soon as the page is fully loaded
window.onload = startTimer;

// Reset the inactivity timer whenever the user moves the mouse
document.onmousemove = resetTimer;

// Reset the inactivity timer whenever the user presses a key
document.onkeypress = resetTimer;


/* ============================================================
   9. closePopup()
   
   Purpose:
     Hides the cart abandonment popup by re-adding the "hidden"
     CSS class to the popup element, which sets display: none.
   
   Behaviour:
     - Selects the popup element (id="popup").
     - Adds the "hidden" class to conceal it from the user.
     - Does not stop the inactivity timer; the popup will not
       reappear because discountUsed is set to true once used,
       and the popup no longer has content to trigger again.
   
   Called by : applyPopupDiscount() after the discount is applied.
   Parameters : None
   Returns    : void
============================================================ */
function closePopup() {
  // Re-apply the "hidden" class to hide the popup from the viewport
  document.getElementById("popup").classList.add("hidden");
}
