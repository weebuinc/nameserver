import { decode, encode, Question } from 'dns-packet';

export function getAnswer(buffer: Buffer) {
  const packet = decode(buffer);
  if (packet?.answers?.length > 0) {
    return packet.answers[0];
  }
  return null;
}

export function getEncodedPacket(question: Question) {
  return encode({
    questions: [question]
  });
}
