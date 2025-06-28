export async function submitToDiscord(formData) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('Discord webhook URL not configured');
  }

  const embed = {
    title: '📝 New Form Submission',
    color: 0x7c3aed, // Purple color
    fields: Object.entries(formData).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value || 'Not provided',
      inline: true
    })),
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Typeform Clone'
    }
  };

  const payload = {
    embeds: [embed]
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.statusText}`);
  }

  return response;
}