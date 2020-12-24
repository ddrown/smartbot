const { create, all } = require('mathjs');
const math = create(all);

const limitedEvaluate = math.evaluate;

math.createUnit('mach', '1234.8 km/h');
math.createUnit('au', '149597870700 m');
math.createUnit('parsec', '210000 au');
math.createUnit('lightsecond', '299792 km');

math.import({
  import: function () { throw new Error('Function import is disabled') },
  createUnit: function () { throw new Error('Function createUnit is disabled') },
  evaluate: function () { throw new Error('Function evaluate is disabled') },
  parse: function () { throw new Error('Function parse is disabled') },
  simplify: function () { throw new Error('Function simplify is disabled') },
  derivative: function () { throw new Error('Function derivative is disabled') }
}, { override: true });

exports.doMath = doMath;
function doMath(client, respond, message) {
  const command = message.split(' ');
  if (command.length === 1) {
    client.say(respond, "!math [math]");
    return;
  }
  command.shift();
  try {
    const out = limitedEvaluate(command.join(' '));
    if(typeof(out) === "function") {
      client.say(respond, "No useful output");
      return;
    }
    const s = `${out}`;
    const subs = s.length > 200 ? s.substring(0, 200) + "..." : s;
    client.say(respond, `value: ${subs}`);
  } catch(e) {
    client.say(respond, `error: ${e.message}`);
  }
}
