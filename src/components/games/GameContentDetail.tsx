import type { GameDetailProps } from "@/types"

type Props = {
    game: GameDetailProps
}

export default function PageContentDetail({ game }: Props) {
    return (
        <section className='w-full max-w-6xl mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column - Main Info */}
            <div className='lg:col-span-2 space-y-8'>
                {/* About */}
                <div className='rounded-xl border border-line bg-surface p-6'>
                    <h2 className='text-2xl font-bold mb-4'>About</h2>
                    <div
                        className='text-fg/85 leading-relaxed prose prose-invert max-w-none'
                        dangerouslySetInnerHTML={{ __html: game.description }}
                    />
                </div>

                {/* Platforms & Requirements */}
                <div className='rounded-xl border border-line bg-surface p-6'>
                    <h2 className='text-2xl font-bold mb-4'>Platforms</h2>
                    <div className='space-y-4'>
                        {game.platforms.map(({ platform }) => (
                            <div key={platform.id} className='border-b border-line pb-4 last:border-0 last:pb-0'>
                                <h3 className='font-semibold text-fg mb-2'>{platform.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className='space-y-6'>
                {/* Quick Info */}
                <div className='rounded-xl border border-line bg-surface p-6'>
                    <h2 className='text-xl font-bold mb-4'>Game Info</h2>
                    <div className='space-y-3 text-sm'>
                        {game.released && (
                            <div>
                                <span className='text-muted'>Release Date</span>
                                <p className='text-fg font-medium'>{new Date(game.released).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        )}
                        {game.playtime > 0 && (
                            <div>
                                <span className='text-muted'>Average Playtime</span>
                                <p className='text-fg font-medium'>{game.playtime} hours</p>
                            </div>
                        )}
                        {game.developers && game.developers.length > 0 && (
                            <div>
                                <span className='text-muted'>Developers</span>
                                <p className='text-fg font-medium'>{game.developers.map(d => d.name).join(', ')}</p>
                            </div>
                        )}
                        {game.publishers && game.publishers.length > 0 && (
                            <div>
                                <span className='text-muted'>Publishers</span>
                                <p className='text-fg font-medium'>{game.publishers.map(p => p.name).join(', ')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Genres */}
                {game.genres && game.genres.length > 0 && (
                    <div className='rounded-xl border border-line bg-surface p-6'>
                        <h2 className='text-xl font-bold mb-4'>Genres</h2>
                        <div className='flex flex-wrap gap-2'>
                            {game.genres.map((genre) => (
                                <span
                                    key={genre.id}
                                    className='text-sm px-3 py-1.5 rounded-full border border-line-strong text-fg/85 hover:border-muted transition'
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {game.tags && game.tags.length > 0 && (
                    <div className='rounded-xl border border-line bg-surface p-6'>
                        <h2 className='text-xl font-bold mb-4'>Tags</h2>
                        <div className='flex flex-wrap gap-2'>
                            {game.tags.slice(0, 12).map((tag) => (
                                <span
                                    key={tag.id}
                                    className='text-xs px-2 py-1 rounded-full bg-surface-2 text-muted'
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links */}
                <div className='rounded-xl border border-line bg-surface p-6'>
                    <h2 className='text-xl font-bold mb-4'>Links</h2>
                    <div className='space-y-2'>
                        {game.website && (
                            <a
                                href={game.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='block px-4 py-2 rounded-lg border border-line-strong text-fg/85 hover:border-muted transition text-center'
                            >
                                🌐 Official Website
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}