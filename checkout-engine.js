/**
    pricingRules structure
    ======================

    Consideration: "the CEO and COO change their minds often, 
                   it needs to be flexible regarding our pricing rules"
    
    GOAL: We shouldn't have to rewrite/edit code to change the pricing rules.
    It should just be an input to our program.


    Attempt 1:
    ---------

    [
      {
        productCode: string,
        buyOneGetOneFree: boolean
        pricing: {
          [1, 5]: price,
          [3, rangeEnd]: price,
          [rangeStart, rangeEnd]: price,
          [rangeStart, rangeEnd]: price,
          // ... as many ranges as needed
        }
    },
    //... more products
    ]

    BUT: (1) The user can put in conflicting ranges. 
         (2) We need to use INFINITY for the last range?
    

    Attempt 2:
    ---------

    [
      {
        productCode: string,
        buyOneGetOneFree: boolean
        pricing: {
          1: price,
          5: price,
          10: price,
          15: price,
          // ... more rules
        }
      },
      //... more products
    ]

    Interpret each pricing KEY as "if they buy equal to or more than this amount"

 */

const exampleProductPricingRules = [
  {
    productCode: "FR1",
    productName: "Fruit tea",
    buyOneGetOneFree: true,
    pricing: {
      1: 3.11,
    },
  },
  {
    productCode: "SR1",
    productName: "Strawberry",
    buyOneGetOneFree: false,
    pricing: {
      1: 5.0,
      3: 4.5,
    },
  },
  {
    productCode: "CF1",
    productName: "Coffee",
    buyOneGetOneFree: false,
    pricing: {
      1: 11.23,
    },
  },
];

class Checkout {
  constructor(pricingRules) {
    this.pricingRules = pricingRules;

    /**
     *  cart representation: a Map, each key value pair is productCode => amount
     *  for example:  {'FR1' => 0, 'SR1' => 0, 'CF1' => 0}
     */
    this.cart = new Map(
      pricingRules.map((product) => [product.productCode, 0])
    );

    this.totalPrice = 0;
  }

  addToCart(productCode) {
    let prevAmount = this.cart.get(productCode);

    if (!prevAmount) {
      prevAmount = 0;
    }

    this.cart.set(productCode, prevAmount + 1);
  }

  getTotal() {
    this.#calculateTotal();
    return this.totalPrice;
  }

  // the following methods are private to the class
  #calculateTotal() {
    this.cart.forEach((amount, productCode) => {
      if (amount > 0) {
        const unitPrice = this.#getUnitPrice(amount, productCode);
        const { buyOneGetOneFree } =
          this.#getPricingRulesForProduct(productCode);
        this.totalPrice += unitPrice * amount;

        if (buyOneGetOneFree) {
          const numberOfFreeItems = Math.floor(amount / 2);
          this.totalPrice -= numberOfFreeItems * unitPrice;
        }
      }
    });

    this.totalPrice = this.totalPrice.toFixed(2);
  }

  #getPricingRulesForProduct(productCode) {
    return this.pricingRules.find(
      (product) => product.productCode === productCode
    );
  }

  #getUnitPrice(amount, productCode) {
    const { pricing } = this.#getPricingRulesForProduct(productCode);

    const amounts = Object.keys(pricing);
    /**
     * The amounts may or may not be sorted, depends on value passed to constructor
     * We want the largest integer that is less than or equal to amount
     */

    let largestIntegerLessThanOrEqualToAmount = 0;
    amounts.forEach((a) => {
      if (a <= amount && a > largestIntegerLessThanOrEqualToAmount) {
        largestIntegerLessThanOrEqualToAmount = a;
      }
    });

    return pricing[largestIntegerLessThanOrEqualToAmount];
  }
}

const cart1 = new Checkout(exampleProductPricingRules);
cart1.addToCart("FR1");
cart1.addToCart("SR1");
cart1.addToCart("FR1");
cart1.addToCart("FR1");
cart1.addToCart("CF1");
const cart1Total = cart1.getTotal();
console.log(`cart1 total is ${cart1Total}, should be 22.45`);

const cart2 = new Checkout(exampleProductPricingRules);
cart2.addToCart("FR1");
cart2.addToCart("FR1");
const cart2Total = cart2.getTotal();
console.log(`cart2 total is ${cart2Total}, should be 3.11`);

const cart3 = new Checkout(exampleProductPricingRules);
cart3.addToCart("SR1");
cart3.addToCart("SR1");
cart3.addToCart("FR1");
cart3.addToCart("SR1");
const cart3Total = cart3.getTotal();
console.log(`cart3 total is ${cart3Total} should be 16.61`);
