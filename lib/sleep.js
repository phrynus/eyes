module.exports = async function (ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
};
