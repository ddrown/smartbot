const fetch = require('node-fetch');

async function getPrice(ticker) {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`;
  const quote = await fetch(url).then(res => res.json());
  const price = quote.quoteSummary.result[0].price;
  const gainloss = price.regularMarketChange.raw > 0 ? `+${price.regularMarketChange.fmt}` : price.regularMarketChange.fmt;
  return `${price.shortName} (${price.quoteType}:${price.exchange}/${price.symbol}) ${price.currencySymbol}${price.regularMarketPrice.fmt} ${price.currency} (${gainloss}, ${price.regularMarketChangePercent.fmt})`;
}

async function finance(client, respond, message) {
  const command = message.split(' ');
  if (command.length !== 2) {
    client.say(respond, "!finance [symbol]");
    return;
  }
  const ticker = command[1];
  if (!ticker.match(/^[A-Z0-9.]+$/)) {
    client.say(respond, "invalid characters in ticker name");
    return;
  }
  try {
    const price = await getPrice(ticker);
    client.say(respond, price);
  } catch(e) {
    console.log(e);
  }
}
exports.finance = finance;
