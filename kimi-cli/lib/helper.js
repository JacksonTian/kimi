

export function isVisionModel(id) {
  if (id === 'kimi-latest') {
    return true;
  }

  const visionModelIds = ['moonshot-v1-8k-vision-preview', 'moonshot-v1-32k-vision-preview', 'moonshot-v1-128k-vision-preview'];
  if (visionModelIds.includes(id)) {
    return true;
  }

  return false;
}