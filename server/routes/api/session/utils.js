const colorLetters = '0123456789ABCDEF';

module.exports = {
  generateColor: () => {
    let color = '#';

    for (let i = 0; i < 6; i += 1) {
      color += colorLetters[Math.floor(Math.random() * 16)];
    }
    return color;
  },
};
