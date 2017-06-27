const removeUnits = string => string.replace(/[^0-9.]/g, '');

const parseQuery = string =>
  string
    .replace(/\?/, '')
    .split('&')
    .map(query => query.split('='))
    .filter(s => s.length !== 0)
    .reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {});

const node = (name, props = {}) =>
  Object.assign(document.createElement(name), props);

const parsedQuery = parseQuery(window.location.search);

let selectedSortType = parsedQuery['sort'] ? parsedQuery['sort'] : 'rank';

const sortOptions = document.getElementById('wishlist_sort_options');
const selectedSort = sortOptions.querySelector('.selected_sort');

const sortByDiscountButton = node('a', {
  href: `${window.location.href}?sort=discount`,
  innerText: 'Discount'
});
const sortByDiscountActiveButton = node('span', {
  className: 'selected_sort',
  innerText: 'Discount'
});

const sort = () => {
  const wishlistItems = document.getElementById('wishlist_items');
  const wishlistItemsArray = [...wishlistItems.children];

  // Parse the HTML output and gather the sorting information.
  const wishlistItemsArrayWithParsedPrices = wishlistItemsArray.map(item => {
    // Child of .gameListPriceData
    const priceElement = item.children[1].children[0].children[0];
    const className = priceElement.className;

    let price = 0;
    let discount = 0;
    let savings = 0;
    let fullPrice = 0;

    if (className.indexOf('price') !== -1) {
      price = parseFloat(removeUnits(priceElement.innerText));
    } else if (className.indexOf('discount_block') !== -1) {
      discount = parseInt(removeUnits(priceElement.children[0].innerText), 10);
      price = parseFloat(
        removeUnits(priceElement.children[1].children[1].innerText)
      );
      fullPrice = parseFloat(
        removeUnits(priceElement.children[1].children[0].innerText)
      );
      savings = fullPrice - price;
    }

    return { price, discount, savings, item };
  });

  // Use .replaceChild to efficiently update the container.
  wishlistItemsArrayWithParsedPrices
    .sort((a, b) => {
      if (a.discount > b.discount) {
        return -1;
      }

      if (a.discount < b.discount) {
        return 1;
      }

      if (a.savings > b.savings) {
        return -1;
      }

      if (a.savings < b.savings) {
        return 1;
      }

      return a.price - b.price;
    })
    .forEach(({ item }) => {
      wishlistItems.appendChild(item);
    });
};

const toggleSortButtons = type => {
  sortOptions.replaceChild(sortByDiscountActiveButton, sortByDiscountButton);
  sortOptions.replaceChild(
    node('a', {
      href: `${window.location.href}?sort=${type}`,
      innerText: selectedSort.innerText
    }),
    selectedSort
  );
};

sortByDiscountButton.addEventListener('click', event => {
  event.preventDefault();
  history.pushState(null, null, '?sort=discount');
  toggleSortButtons(selectedSortType);
  sort();
});

window.requestAnimationFrame(() => {
  // Add a non-breaking space between buttons.
  sortOptions.appendChild(document.createTextNode('\u00A0'));
  sortOptions.appendChild(sortByDiscountButton);

  if (selectedSortType === 'discount') {
    toggleSortButtons(selectedSortType);
    sort();
  }
});
