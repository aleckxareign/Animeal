import { LocateFixed } from 'lucide-react'
import { vets } from '../../data/vets'

const filters = ['24/7 Emergency', 'Open now', 'Cats', 'Dogs']

export default function NearbyVets() {
  return (
    <section
      className="relative bg-[#dfe8dc] bg-cover bg-center"
      /* PLACEHOLDER: export the map from your design as public/images/map.png */
      style={{ backgroundImage: "url('/images/map.png')" }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-white/95 p-8 shadow-lg lg:max-w-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-dark/70">
            Find a vet
          </p>
          <h2 className="font-display text-4xl text-brand-dark">Nearby vets, ready when you are.</h2>
          <p className="mt-3 text-gray-600">
            Locate nearby veterinary clinics with their address, contact number, directions, and
            emergency services.
          </p>

          <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white">
            <LocateFixed size={16} /> Use my location
          </button>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {filters.map((f) => (
              <span
                key={f}
                className={`rounded-full border px-3 py-1 font-medium ${
                  f === '24/7 Emergency'
                    ? 'border-brand-alert/30 bg-brand-alert-light text-brand-alert'
                    : 'border-gray-300 bg-white text-brand-dark'
                }`}
              >
                {f}
              </span>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            For emergencies, call ahead so the clinic can prepare for your pet.
          </p>
        </div>

        <div className="space-y-4 lg:ml-auto lg:w-full lg:max-w-sm">
          {vets.map((vet) => (
            <article
              key={vet.id}
              className={`rounded-xl bg-white p-4 shadow-lg ${
                vet.emergency ? 'border-2 border-brand-alert' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    vet.emergency
                      ? 'bg-brand-alert text-white'
                      : 'bg-brand-sage-light/30 text-brand-dark'
                  }`}
                >
                  {vet.emergency ? '24/7 Emergency' : 'Open now'}
                </span>
                <span className="text-xs text-gray-500">[{vet.distance}]</span>
              </div>
              <h3 className="mt-3 font-display text-xl text-brand-dark">{vet.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{vet.address}</p>
              <p className="text-xs text-gray-500">{vet.phone}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  className={`rounded-md py-2 text-white ${
                    vet.emergency ? 'bg-brand-alert' : 'bg-brand-dark'
                  }`}
                >
                  Call now
                </button>
                <button className="rounded-md border border-brand-dark py-2 text-brand-dark">
                  Directions
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}