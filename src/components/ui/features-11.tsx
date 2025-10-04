import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Brain, Clock, Shield, Zap, Sparkles, Search } from 'lucide-react'

export function Features() {
    return (
        <section className="dark:bg-muted/25 bg-zinc-50 py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
                    <p className="text-muted-foreground text-lg">Everything you need to preserve your memories</p>
                </div>
                <div className="mx-auto grid gap-2 sm:grid-cols-5">
                    <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl">
                        <CardHeader>
                            <div className="md:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="font-semibold text-xl">AI-Powered Memory Organization</p>
                                </div>
                                <p className="text-muted-foreground mt-3 max-w-sm text-sm">Alma intelligently categorizes and organizes your memories, making them easy to find and revisit whenever you need them.</p>
                            </div>
                        </CardHeader>

                        <div className="relative h-fit pl-6 md:pl-12">
                            <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,hsl(var(--background))_100%)]"></div>

                            <div className="bg-background overflow-hidden rounded-tl-lg border-l border-t pl-2 pt-2 dark:bg-zinc-950">
                                <div className="bg-gradient-to-br from-primary/20 to-primary-glow/20 p-8 rounded-tl-lg min-h-[300px] flex items-center justify-center">
                                    <div className="text-center">
                                        <Sparkles className="w-20 h-20 text-primary mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground">Your memories, beautifully organized</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
                        <p className="mx-auto my-6 max-w-md text-balance px-6 text-center text-lg font-semibold sm:text-2xl md:p-6">Timeline View - Navigate through your memories with ease</p>

                        <CardContent className="mt-auto h-fit">
                            <div className="relative mb-6 sm:mb-0">
                                <div className="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                                <div className="aspect-76/59 overflow-hidden rounded-r-lg border p-6 bg-gradient-to-br from-primary/5 to-transparent">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary" />
                                            <div className="h-2 bg-primary/20 rounded-full flex-1"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary" />
                                            <div className="h-2 bg-primary/30 rounded-full flex-1"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary" />
                                            <div className="h-2 bg-primary/40 rounded-full flex-1"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="group p-6 shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-12">
                        <p className="mx-auto mb-12 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl">Quick Access - Find memories instantly</p>

                        <div className="flex justify-center gap-6">
                            <div className="inset-shadow-sm dark:inset-shadow-white/5 bg-muted/35 relative flex aspect-square size-16 items-center rounded-[7px] border p-3 shadow-lg ring dark:shadow-white/5 dark:ring-black">
                                <span className="absolute right-2 top-1 block text-sm">⌘</span>
                                <Search className="mt-auto size-4" />
                            </div>
                            <div className="inset-shadow-sm dark:inset-shadow-white/5 bg-muted/35 flex aspect-square size-16 items-center justify-center rounded-[7px] border p-3 shadow-lg ring dark:shadow-white/5 dark:ring-black">
                                <span>K</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl">
                        <CardHeader className="p-6 md:p-12">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                                <p className="font-semibold text-xl">Private & Secure</p>
                            </div>
                            <p className="text-muted-foreground mt-2 max-w-sm text-sm">Bank-level encryption ensures your memories are completely private and secure.</p>
                        </CardHeader>
                        <CardContent className="relative h-fit px-6 pb-6 md:px-12 md:pb-12">
                            <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                                    <Shield className="size-8 text-primary" />
                                </div>
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                                    <Zap className="size-8 text-primary" />
                                </div>
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                                    <Clock className="size-8 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
