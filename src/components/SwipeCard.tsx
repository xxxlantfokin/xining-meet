"use client";

type UserCard = {
  id: string;
  name: string;
  gender: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
};

export default function SwipeCard({
  user,
  ageLabel,
  maleLabel,
  femaleLabel,
}: {
  user: UserCard;
  ageLabel: string;
  maleLabel: string;
  femaleLabel: string;
}) {
  const genderLabel = user.gender === "male" ? maleLabel : femaleLabel;
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-amber-100">
      <div className="relative flex-1 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16 text-white">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {user.name}
                <span className="ml-2 text-lg font-medium opacity-90">
                  {user.age}
                  {ageLabel}
                </span>
              </h2>
              <p className="mt-1 text-sm text-white/85">
                {user.city} · {genderLabel}
              </p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/90">
            {user.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
