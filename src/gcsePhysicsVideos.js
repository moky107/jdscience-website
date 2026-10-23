/* Hosted GCSE Physics lessons for /papers Videos and public /resources pages.
 *
 * Narration is the ElevenLabs cloned voice (original accent). Do not publish
 * Azure Neural / en-NG-AbeoNeural stand-ins on these paths.
 */

function lesson({ title, topicSlug, file_name, source_path, description }) {
  return {
    level: "GCSE/IGCSE",
    subject: "Physics",
    exam_board: "AQA",
    resource_category: "Videos",
    all_boards: true,
    title,
    topicSlug,
    file_name,
    source_path,
    description,
    file_url_override: `/resources/gcse/physics/videos/${topicSlug}/${file_name}`,
    notesHtml: `<div class="callout">Original JD Science GCSE Physics lesson. Watch on this page, or download the MP4.</div><p>${description}</p>`,
  };
}

export const GCSE_PHYSICS_LESSON_VIDEOS = [
  lesson({
    title: "Energy Stores and Pathways",
    topicSlug: "energy-stores-and-pathways",
    file_name: "jdscience-energy-stores-and-pathways-1080p.mp4",
    source_path: "content/videos/energy-stores-and-pathways/jdscience-energy-stores-and-pathways-1080p.mp4",
    description: "Identify the main energy stores, explain transfer pathways, and apply them to GCSE-style questions.",
  }),
  lesson({
    title: "Gravitational Potential Energy",
    topicSlug: "gravitational-potential-energy",
    file_name: "jdscience-gravitational-potential-energy-1080p.mp4",
    source_path: "content/videos/gravitational-potential-energy/jdscience-gravitational-potential-energy-1080p.mp4",
    description: "Explain how an object gains GPE, calculate ΔEp = mgΔh, and practise a GCSE examination question.",
  }),
  lesson({
    title: "Kinetic Energy",
    topicSlug: "kinetic-energy",
    file_name: "jdscience-kinetic-energy-1080p.mp4",
    source_path: "content/videos/kinetic-energy/jdscience-kinetic-energy-1080p.mp4",
    description: "Use Ek = ½mv², explain why speed has a squared effect, and work through GCSE calculations.",
  }),
  lesson({
    title: "Energy Stores and Systems",
    topicSlug: "energy-stores-and-systems",
    file_name: "jdscience-energy-stores-and-systems-1080p.mp4",
    source_path: "content/videos/energy-stores-and-systems/jdscience-energy-stores-and-systems-1080p.mp4",
    description: "Track energy stores within a system and describe transfers for everyday Physics examples.",
  }),
  lesson({
    title: "Energy Transfers in a System",
    topicSlug: "energy-transfers-in-a-system",
    file_name: "jdscience-energy-transfers-in-a-system-1080p.mp4",
    source_path: "content/videos/energy-transfers-in-a-system/jdscience-energy-transfers-in-a-system-1080p.mp4",
    description: "Follow energy transfers step by step inside a system and link them to conservation of energy.",
  }),
  lesson({
    title: "Energy Efficiency",
    topicSlug: "energy-efficiency",
    file_name: "jdscience-energy-efficiency-1080p.mp4",
    source_path: "content/videos/energy-efficiency/jdscience-energy-efficiency-1080p.mp4",
    description: "Calculate efficiency from useful and total energy or power, and interpret Sankey-style results.",
  }),
  lesson({
    title: "Reducing Unwanted Energy Transfers",
    topicSlug: "reducing-unwanted-energy-transfers",
    file_name: "jdscience-reducing-unwanted-energy-transfers-1080p.mp4",
    source_path: "content/videos/reducing-unwanted-energy-transfers/jdscience-reducing-unwanted-energy-transfers-1080p.mp4",
    description: "Explain how lubrication, insulation and design choices reduce unwanted energy transfers.",
  }),
  lesson({
    title: "Thermal Insulation and Thermal Conductivity",
    topicSlug: "thermal-insulation-and-conductivity",
    file_name: "jdscience-thermal-insulation-and-conductivity-1080p.mp4",
    source_path: "content/videos/thermal-insulation-and-conductivity/jdscience-thermal-insulation-and-conductivity-1080p.mp4",
    description: "Link thermal conductivity to heat transfer rate and compare insulating materials for GCSE questions.",
  }),
  lesson({
    title: "Non-Renewable Energy Resources",
    topicSlug: "non-renewable-energy-resources",
    file_name: "jdscience-non-renewable-energy-resources-1080p.mp4",
    source_path: "content/videos/non-renewable-energy-resources/jdscience-non-renewable-energy-resources-1080p.mp4",
    description: "Compare fossil fuels and nuclear power, including reliability, use and environmental impact.",
  }),
  lesson({
    title: "Renewable Energy Resources",
    topicSlug: "renewable-energy-resources",
    file_name: "jdscience-renewable-energy-resources-1080p.mp4",
    source_path: "content/videos/renewable-energy-resources/jdscience-renewable-energy-resources-1080p.mp4",
    description: "Explain renewable resources such as wind, solar, hydro and biofuels with exam-style evaluation points.",
  }),
  lesson({
    title: "Security and Reliability of Energy Supplies",
    topicSlug: "energy-security-and-reliability",
    file_name: "jdscience-energy-security-and-reliability-1080p.mp4",
    source_path: "content/videos/energy-security-and-reliability/jdscience-energy-security-and-reliability-1080p.mp4",
    description: "Discuss energy security, reliability and the need for a mix of energy resources.",
  }),
  lesson({
    title: "Trends in Energy Use",
    topicSlug: "trends-in-energy-use",
    file_name: "jdscience-trends-in-energy-use-1080p.mp4",
    source_path: "content/videos/trends-in-energy-use/jdscience-trends-in-energy-use-1080p.mp4",
    description: "Interpret trends in energy use and explain why patterns of demand and supply change over time.",
  }),
];

export const GCSE_PHYSICS_VIDEOS = [...GCSE_PHYSICS_LESSON_VIDEOS];
