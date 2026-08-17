'use client';

import { Calendar, Users, Bell, Wifi, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  { icon: Calendar, title: 'תצוגות מרובות', desc: 'יום, שבוע, חודש וסמסטר' },
  { icon: Users, title: 'ריבוי ילדים/ישויות', desc: 'הוסף כמה שצריך - גן, בית ספר, חוגים' },
  { icon: Bell, title: 'התראות דחיפה', desc: 'עדכונים בזמן אמת על שינויים' },
  { icon: Wifi, title: 'עובד אופליין', desc: 'גישה מלאה גם בלי אינטרנט' },
  { icon: CheckCircle2, title: 'סנכרון אוטומטי', desc: 'בין בני הזוג בלי שרת מרכזי' },
  { icon: Loader2, title: 'לוח שנה חכם', desc: 'חגים ישראליים/שוויצריים מובנים' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">zman</h1>
          <nav className="flex items-center gap-4">
            <a href="/entities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              ניהול ישויות
            </a>
            <a href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              הגדרות
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            גרסת בטא - פועל אופליין ומסתנכרן אוטומטית
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            לוח שעות משפחתי
            <br />
            <span className="text-primary">פשוט. משותף. תמיד מעודכן.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            נהל את יומן הגן, בית הספר והחוגים של הילדים במקום אחד.
            עובד אופליין, מסתנכרן אוטומטית בינך לבן/בת הזוג.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors">
              התחל עכשיו
            </button>
            <button className="w-full sm:w-auto bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-secondary/80 transition-colors">
              צפה בדמו
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12">כל מה שצריך ביומן משפחתי</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <article
                key={index}
                className={cn(
                  'group p-6 rounded-xl bg-white dark:bg-gray-800 border border-border',
                  'transition-all duration-300 hover:shadow-lg hover:border-primary/50'
                )}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12">איך זה עובד</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'צור ישות', desc: 'הוסף ילד, גן, בית ספר או חוג עם צבע וסמל' },
              { step: '2', title: 'הגדר לוח זמנים', desc: 'קבע ימים קבועים, חגים ושינויים חד-פעמיים' },
              { step: '3', title: 'שתף עם בן/בת הזוג', desc: 'קוד הזמנה פשוט - אין צורך בחשבון או סיסמה' },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-border -z-10" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-background/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">zman - לוח שעות משפחתי</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">פרטיות</a>
            <a href="#" className="hover:text-foreground transition-colors">תנאים</a>
            <a href="#" className="hover:text-foreground transition-colors">קוד פתוח</a>
          </div>
        </div>
      </footer>
    </main>
  );
}