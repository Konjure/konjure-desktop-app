const crypto = require('crypto');
const base58 = require('bs58');

exports.sha256bs58HashString = (data) => {
  const digest = crypto.createHash('sha256').update(data).digest();
  const digestSize = Buffer.from(digest.byteLength.toString(16), 'hex');
  const comb = Buffer.concat([Buffer.from('12', 'hex'), digestSize, digest]);
  const multihash = base58.encode(comb);

  return multihash.toString();
};
