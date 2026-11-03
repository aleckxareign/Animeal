export const dogBreeds = [
  'Aspin (Asong Pinoy)',
  'Beagle',
  'Bulldog',
  'Chihuahua',
  'Chow Chow',
  'Dachshund',
  'Dalmatian',
  'Doberman',
  'French Bulldog',
  'German Shepherd',
  'Golden Retriever',
  'Husky',
  'Labrador Retriever',
  'Maltese',
  'Miniature Pinscher',
  'Pomeranian',
  'Poodle',
  'Pug',
  'Rottweiler',
  'Shiba Inu',
  'Shih Tzu',
  'Mixed Breed',
  'Other',
]

export const catBreeds = [
  'Puspin (Pusang Pinoy)',
  'American Shorthair',
  'Bengal',
  'British Shorthair',
  'Calico',
  'Maine Coon',
  'Munchkin',
  'Persian',
  'Ragdoll',
  'Russian Blue',
  'Scottish Fold',
  'Siamese',
  'Sphynx',
  'Tabby',
  'Mixed Breed',
  'Other',
]

export function getBreeds(species: 'dog' | 'cat'): string[] {
  return species === 'dog' ? dogBreeds : catBreeds
}

