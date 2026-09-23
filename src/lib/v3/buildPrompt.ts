// Homemotion v3 — buildVideoPrompt(): same structure for both models.
// Only difference: image notation (@Image1 vs "Image 1").
import { MODEL_CONFIG, type ModelId, type RenderParams } from './config';
import type { ShotPlan } from './shotPlanner';

// Fixed character card (v3)
const CHARACTER = `A sophisticated European male real estate agent in his late 40s, short neatly styled blonde hair brushed back with a natural side part, light blue eyes, subtle well-groomed blonde stubble, fitted black crew-neck sweater, light beige trousers, classic silver wristwatch with a light dial. Calm, confident, approachable.`;

const FORMAT_HEADER: Record<RenderParams['format'], string> = {
  walkthrough:
    'a cinematic walkthrough of the property with no people on camera, guided by a calm professional voice-over',
  lifestyle:
    'a lifestyle scene of a couple in their early 30s naturally living the space, with a calm professional voice-over',
  agent:
    'the real estate agent presenting the property on camera with short spoken dialogue and accurate lip sync',
};

function imgRef(model: ModelId, index: number): string {
  return MODEL_CONFIG[model].imageNotation === 'at' ? `@Image${index}` : `Image ${index}`;
}

const hhmmss = (sec: number) =>
  `00:${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export function buildVideoPrompt(
  params: RenderParams,
  plan: ShotPlan,
  photos: { room: string; url: string }[],
): string {
  const langName = params.language === 'de' ? 'German' : 'English';
  const hasPeople = params.format !== 'walkthrough';
  const isAgent = params.format === 'agent';

  const blocks: string[] = [];

  // 1. Header
  blocks.push(
    `Create a ${params.duration}-second photorealistic, high-end real estate commercial: ` +
      `${FORMAT_HEADER[params.format]}. 16:9 aspect ratio.` +
      (params.propertyType === 'new'
        ? ' Present it as an architectural project / off-plan development.'
        : ''),
  );

  // 2. Reference images — STRICT
  blocks.push('REFERENCE IMAGES — STRICT:\n' + photos
    .map((p, i) => `${imgRef(params.model, i + 1)} shows the ${p.room.toLowerCase()} of the property.`)
    .join('\n') +
    '\nThese images define the exact property. Do not introduce any other property, layout or furniture.');

  // 3. Character (agent / lifestyle only)
  if (hasPeople) {
    blocks.push(
      `CHARACTER:\n${CHARACTER}\nKeep face, hair, clothing and wristwatch identical in every shot.`,
    );
  }

  // 4. Shots
  const shotBlocks = plan.shots.map((s, i) => {
    const lines = [
      `SHOT ${i + 1} — ${s.shot} | ${hhmmss(s.start)}–${hhmmss(s.end)}`,
      `Reference: ${imgRef(params.model, s.image)}`,
      `Camera: ${s.camera}`,
      `Action: ${s.action}`,
    ];
    if (s.dialogue) {
      lines.push(`Dialogue: "${s.dialogue}"`);
      lines.push(`with accurate ${langName} lip synchronization`);
    }
    return lines.join('\n');
  });
  blocks.push('SHOTS:\n' + shotBlocks.join('\n\n'));

  // 5. Voiceover
  if (!isAgent && plan.voiceover) {
    blocks.push(
      `VOICEOVER: A calm professional ${langName} voiceover narrates: "${plan.voiceover}"`,
    );
  }

  // 6. Cinematography
  blocks.push(
    'CINEMATOGRAPHY: stabilized camera, smooth dolly and lateral tracking moves, natural depth of field, ' +
      'real close-ups (no digital zoom), natural white daylight, no heavy yellow/orange color grading.',
  );

  // 7. Natural human movement
  if (hasPeople) {
    blocks.push(
      'NATURAL HUMAN MOVEMENT: believable walking rhythm and weight transfer, no foot skating, ' +
        'no teleporting, continuous spatial geography between cuts.',
    );
  }

  // 8. Strict consistency
  const cons = [
    'STRICT CONSISTENCY: preserve the architecture, furniture and proportions exactly as shown in the reference images.',
    'Do not add rooms, extra people, logos, subtitles or any on-screen text.',
  ];
  if (params.propertyType === 'new') {
    cons.push('preserve the architectural visualization exactly as shown');
  }
  blocks.push(cons.join(' '));

  // 9. Audio
  blocks.push(
    'AUDIO: no background music. Only natural room ambience, soft footsteps where applicable, and the voice/dialogue.',
  );

  return blocks.join('\n\n');
}
