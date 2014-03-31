function Budget(startingVal)
{
  //jQuery reference for the budget object
  this.amountRef = $("#budget #amountLeft");
  
  this.amountLeft = startingVal;
  
  this.amountRef.html(this.amountLeft);
  //$("#amountLeft").html(startingVal);
}

Budget.prototype.setAmountLeft = function(newAmount) {
    if (newAmount >= 0) {
        this.amountLeft = newAmount;
        this.amountRef.html(this.amountLeft);
    }
}

Budget.prototype.subtractAmount = function(amount) {
    if (this.amountLeft - amount >= 0) {
        this.amountLeft -= amount;
        this.amountRef.html(this.amountLeft);
    }
}