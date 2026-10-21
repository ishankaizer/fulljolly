// Every instruction Pip speaks. The text is what the built-in voice says until it is recorded.
// To change a line, change it here: the recording studio and the lessons both read from this list.
export const promptLines: Record<string, string> = {
  welcome: 'Hello! I am Pip. Press play to start!',
  'meet-family': 'These words all end with',
  'trace-intro': 'Trace the letter with your finger. Say its sound!',
  'trace-again': 'Follow the dotted line',
  'sound-intro': 'Listen. This letter makes this sound.',
  'pick-intro': 'Listen. Which letter makes this sound?',
  'dots-intro': 'Touch each dot and say the sound. Then blend them together!',
  'blend-intro': 'Slide the ball under the letters. Say each sound!',
  'build-intro': 'Listen. What sound does it start with?',
  'match-intro': 'Read the word. Then tap its picture!',
  'swap-intro': 'Change the middle sound to make the word.',
  'try-again': 'Listen again',
  'look-again': 'Look at the letters again',
  'well-done': 'Well done! You are a super reader!',
}
