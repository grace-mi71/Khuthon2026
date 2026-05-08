export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-3xl font-black text-white tracking-tighter">딴길</div>
        <div className="flex gap-8 text-[15px] font-medium">
          <a href="#" className="hover:text-white transition">이용약관</a>
          <a href="#" className="hover:text-white transition">개인정보처리방침</a>
          <a href="#" className="hover:text-white transition">고객센터</a>
        </div>
        <p className="text-sm text-gray-600">© 2026 Tangil. All rights reserved.</p>
      </div>
    </footer>
  );
}
