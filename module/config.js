/** @name CONFIG.Liminal */
export const Liminal = {};

Liminal.characterGenerator = {
  ability: "3d6",
  hitProtection: "1d6",
  cash: "3d6",
  name: {
    text: "{name} {surname}",
    items: {
      name: "liminal.character-creation-tables-srd;Names",
      surname: "liminal.character-traits;Surnames"
    }
  },
  background: "liminal.character-traits;Background",
  startingItems: [
    "liminal.expeditionary-gear;Rations;1",
    "liminal.expeditionary-gear;Torch;1"
  ],
  startingGear: [
    "liminal.character-creation-tables-srd;Starting Gear - Armor",
    "liminal.character-creation-tables-srd;Starting Gear - Helmet & Shields",
    "liminal.character-creation-tables-srd;Starting Gear - Weapons",
    "liminal.character-creation-tables-srd;Starting Gear - Expeditionary Gear",
    "liminal.character-creation-tables-srd;Starting Gear - Tools",
    "liminal.character-creation-tables-srd;Starting Gear - Trinkets",
    "liminal.character-creation-tables-srd;Starting Gear - Bonus Item"
  ],
  biography: {
    text: "I have a <strong>{physique}</strong> physique, <strong>{skin}</strong> skin, <strong>{hair}</strong> hair, and a <strong>{face}</strong> face. I speak in a <strong>{speech}</strong> manner and wear <strong>{clothing}</strong> clothing. I am <strong>{vice}</strong> yet <strong>{virtue}</strong>, and I am generally regarded as <strong>{reputation}</strong>. I have had the misfortune of being <strong>{misfortune}</strong>. I am <strong>{age}</strong> years old.",
    age: "2d20 + 10",
    items: {
      physique: "liminal.character-traits;Physique",
      skin: "liminal.character-traits;Skin",
      hair: "liminal.character-traits;Hair",
      face: "liminal.character-traits;Face",
      speech: "liminal.character-traits;Speech",
      clothing: "liminal.character-traits;Clothing",
      vice: "liminal.character-traits;Vice",
      virtue: "liminal.character-traits;Virtue",
      misfortune: "liminal.character-traits;Misfortunes",
      reputation: "liminal.character-traits;Reputation"
    }
  }
};

CONFIG.Liminal = Liminal;

