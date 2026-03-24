/**
 * Utilitário para reproduzir sons
 */

export function playCashRegisterSound() {
  // Criar contexto de áudio
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Notas da caixa registradora (sequência típica)
  const notes = [
    { freq: 1047, duration: 0.1 }, // C5
    { freq: 1319, duration: 0.1 }, // E5
    { freq: 1568, duration: 0.2 }, // G5
  ];

  let time = audioContext.currentTime;

  notes.forEach(({ freq, duration }) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = freq;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.start(time);
    osc.stop(time + duration);

    time += duration + 0.05;
  });
}
