"use client";
import React, { useState } from "react";

const NewReservationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    guests: 2,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle form submission, e.g., send data to an API
    console.log("Reservation Submitted:", formData);
    setSubmitted(true);
  };

  const handleModify = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      date: "",
      time: "",
      guests: 2,
    });
  };

  return (
    <section id="reservation" className="py-32 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-white overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
          <div className="lg:w-2/5 h-[400px] lg:h-auto relative">
            <img
              src="/Menu/menu7.jpg"
              alt="Elegant dining table setup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-sala-primary/40 mix-blend-multiply"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-center text-white border border-white/20 p-8 backdrop-blur-sm">
                <span className="block text-xs tracking-[0.5em] uppercase font-black mb-4">
                  Availability
                </span>
                <p className="font-serif text-2xl italic">
                  We prepare a limited selection of tables to ensure every guest
                  receives our full attention.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-3/5 p-12 lg:p-24">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-24 h-24 border border-sala-accent rounded-full flex items-center justify-center mb-8">
                  <div className="w-3 h-3 bg-sala-accent rounded-full"></div>
                </div>
                <h3 className="text-4xl font-serif mb-6 text-sala-primary">
                  Your Table Awaits
                </h3>
                <p className="text-stone-500 mb-10 max-w-sm leading-relaxed">
                  A confirmation of your culinary journey has been sent to your
                  email address. We look forward to welcoming you.
                </p>
                <button
                  onClick={handleModify}
                  className="text-sala-accent tracking-[0.3em] uppercase font-black text-xs border-b-2 border-sala-accent pb-1 hover:text-sala-primary hover:border-sala-primary transition-all"
                >
                  Make Another Reservation
                </button>
              </div>
            ) : (
              <>
                <div className="mb-12">
                  <span className="text-sala-accent tracking-[0.3em] uppercase text-xs mb-4 block font-bold">
                    Reservations
                  </span>
                  <h2 className="text-5xl font-serif text-sala-primary">
                    Secure a Sanctuary
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors text-lg font-light"
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors text-lg font-light"
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                        Date
                      </label>
                      <input
                        required
                        type="date"
                        name="date"
                        className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors font-light"
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                        Time
                      </label>
                      <input
                        required
                        type="time"
                        name="time"
                        className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors font-light"
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                        Guests
                      </label>
                      <select
                        name="guests"
                        className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors font-light"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            guests: parseInt(e.target.value),
                          })
                        }
                        value={formData.guests}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-6 bg-sala-primary text-white uppercase tracking-[0.4em] font-black text-xs hover:bg-sala-accent transition-all duration-500 mt-6 shadow-2xl"
                  >
                    Confirm Reservation
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewReservationForm;
