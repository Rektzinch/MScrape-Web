import Image from "next/image";

export function AppFooter() {
  return (
    <footer className="dashboard-footer wb-shell app-footer">
      <p className="dashboard-footer__statement">Temukan data yang relevan. Lanjutkan dengan keputusan yang tepat.</p>
      <div className="dashboard-footer__meta">
        <div className="app-footer__brand">
          <Image className="app-footer__logo" src="/media/mscrape-logo.png" alt="MScrape" width={2172} height={724} />
          <Image className="app-footer__mascot" src="/media/mscrape-mascot.png" alt="Maskot MScrape" width={1224} height={1285} />
        </div>
        <span>MScrape · data bisnis untuk riset, analisis, dan tindak lanjut</span>
      </div>
    </footer>
  );
}
