module.exports = {
  async fn() {
    const disableIndexing = process.env.DISABLE_INDEXING === 'true';

    const body = disableIndexing ? `User-agent: *\nDisallow: /` : `User-agent: *\nAllow: /`;

    return this.res.type('text/plain').send(body);
  },
};
