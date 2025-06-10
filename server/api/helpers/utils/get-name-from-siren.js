const fs = require('fs');
const path = require('path');

module.exports = {
  inputs: {
    siren: {
      type: 'string',
      required: true,
    },
  },

  fn(inputs) {
    const filePath = path.join(__dirname, '../../../dumps/sirenes.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    const entry = data.find((e) => String(e.siren) === String(inputs.siren).slice(0, 9));
    return entry ? entry.nom_complet : inputs.siren;
  },
};
