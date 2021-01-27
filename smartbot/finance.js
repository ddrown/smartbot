const fetch = require('node-fetch');

async function getPrice(ticker) {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`;
  const quote = await fetch(url).then(res => res.json());
  const price = quote.quoteSummary.result[0].price;

  if(price.shortName === null || price.shortName === undefined) {
    return `unable to get prices for ${ticker}`;
  }

  const gainloss = price.regularMarketChange.raw > 0 ? `+${price.regularMarketChange.fmt}` : price.regularMarketChange.fmt;
  const regularStatus = `${price.shortName} (${price.quoteType}:${price.exchange}/${price.symbol}) ${price.currencySymbol}${price.regularMarketPrice.fmt} ${price.currency} (${gainloss}, ${price.regularMarketChangePercent.fmt})`;

  const postGainloss = price.postMarketChange.raw > 0 ? `+${price.postMarketChange.fmt}` : price.postMarketChange.fmt;
  const postMarketStatus = price.marketState === "POSTPOST" ? `aftermarket: ${price.currencySymbol}${price.postMarketPrice.fmt} (${postGainloss}, ${price.postMarketChangePercent.fmt})` : "";

  return `${regularStatus} ${postMarketStatus} state=${price.marketState}`;
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
