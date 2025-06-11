const lowercaseWords = [
  'de',
  'des',
  'du',
  'le',
  'la',
  'les',
  'un',
  'une',
  'et',
  'ou',
  'à',
  'au',
  'aux',
  'en',
  'dans',
  'sur',
  'pour',
  'par',
  'avec',
  'sans',
  'sous',
  'chez',
];

function capitalizeWord(word) {
  if (word.includes("'")) {
    const parts = word.split("'");
    return `${parts[0]}'${parts[1].charAt(0).toUpperCase()}${parts[1].slice(1)}`;
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

module.exports = {
  inputs: {
    string: {
      type: 'string',
      required: true,
    },
  },
  fn(inputs) {
    if (!inputs.string) return inputs.string;

    return inputs.string
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return capitalizeWord(word);
        }

        if (lowercaseWords.includes(word)) {
          return word;
        }

        return capitalizeWord(word);
      })
      .join(' ');
  },
};
