import { useLanguage } from '../context/LanguageContext';

export default function AboutSection() {
    const { t } = useLanguage();

    return (
        <section
            aria-labelledby="about-heading"
            className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-5 sm:p-7"
        >
            <div className="max-w-3xl mx-auto">
                <h2 id="about-heading" className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
                    💛 {t('aboutTitle')}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{t('aboutLead')}</p>

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mt-4">{t('aboutCareIntro')}</p>
                <ul className="mt-2 space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex gap-2">
                        <span aria-hidden="true" className="text-[#ff9900] font-bold">•</span>
                        <span>{t('aboutCare1')}</span>
                    </li>
                    <li className="flex gap-2">
                        <span aria-hidden="true" className="text-[#ff9900] font-bold">•</span>
                        <span>{t('aboutCare2')}</span>
                    </li>
                    <li className="flex gap-2">
                        <span aria-hidden="true" className="text-[#ff9900] font-bold">•</span>
                        <span>{t('aboutCare3')}</span>
                    </li>
                    <li className="flex gap-2">
                        <span aria-hidden="true" className="text-[#ff9900] font-bold">•</span>
                        <span>{t('aboutCare4')}</span>
                    </li>
                </ul>

                <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{t('aboutFree')}</p>
                </div>
            </div>
        </section>
    );
}
