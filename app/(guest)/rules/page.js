
const markdownContent = `
osu! Indonesia Tournament #13 (2023) akan dilangsungkan dengan dua tahapan utama, yakni Qualifier Stage dan Knock-Out Stage. Berikut penjelasan mengenai tahapan osu! Indonesia Tournament #13 (2023).

**Qualifier**
- Tahapan Qualifier akan dilangsungkan di dalam beberapa room multiplayer (Qualifier Lobby) secara paralel.
- Terdapat total 11 map (mod-specific) yang harus dimainkan secara berurutan oleh para peserta.
- Semua rangkaian pertandingan Qualifier akan menggunakan No-Fail.
- Pada Qualifier terdapat 11 map dengan mod-specific 4 No Mod | 2 Hidden | 2 Hard Rock | 3 Double Time.
- Masing-masing peserta hanya diperbolehkan untuk berpartisipasi di dalam salah satu Qualifier Lobby. Peserta yang telah ikut serta pada salah satu Qualifier Lobby tidak diperkenankan untuk kembali bermain ke dalam Qualifier Lobby lainnya dengan alasan apapun.
- Total poin masing-masing peserta dari kesepuluh map akan kemudian diakumulasikan oleh panitia berdasarkan mp link yang tersedia. 16 peserta dengan total Z-Sum tertinggi akan dinyatakan lolos ke tahapan Knock-Out Stage.

**Knock-Out Stage**
- Tahapan Knock-Out meliputi lima fase yakni fase Round of 16, Quarterfinals, Semifinals, Finals dan Grandfinals.
- Tahapan Knock-Out dilangsungkan dengan sistem eliminasi ganda (double elimination) sesuai dengan bracket yang tertera pada Challonge resmi osu! Indonesia Tournament #13 (2023).
- Pertandingan pada tiap-tiap fasenya akan dilangsungkan dengan kondisi sebagai berikut:
  - Round of 16: Best of 9 (6.9*)
  - Quarter-Finals: Best of 11 (7.1*)
  - Semi-Finals: Best of 11 (7.3*)
  - Finals: Best of 13 (7.5*)
  - Grand-Final: Best of 13 (7.8*)
- Masing-masing peserta akan memiliki hak untuk melakukan ban satu map dari mappool Round of 16 dan dua map dari mappool Quarterfinals, Semifinals, Finals dan Grandfinals, tidak ada larangan untuk melakukan banning atau picking pada mod yang bersamaan.
- Secara singkat urutan Banning adalah: ABBA
- Bracket reset akan dilangsungkan jika pemenang lower bracket grandfinal memenangkan pertandingan pertama-nya melawan Grandfinalist dari Upper Bracket.
- Tie Break akan berlangsung apabila diperlukan.
- Keseluruhan pertandingan akan dilangsungkan dalam setting TeamVS., ScoreV2 dan keadaan room akan menggunakan NoFail. Waktu untuk tiap-tiap pertandingan akan ditentukan sebelumnya oleh panitia, namun para peserta yang bertanding diperbolehkan untuk melakukan reschedule (baik melalui channel #reschedule yang disediakan oleh panitia pada Discord OIT 2023 ataupun pada media-media lainnya) dengan catatan bahwa panitia harus diinformasikan sebelumnya terkait rencana pergantian jadwal yang telah disepakati.
- Peraturan yang tertera bersifat fleksibel, di mana peraturan dapat berubah sewaktu-waktu baik dengan atau tanpa pemberitahuan lebih lanjut sebelumnya.
- Peserta yang tidak hadir dalam rentang waktu 10 menit setelah jadwal yang telah ditentukan tanpa pemberitahuan sebelumnya dapat langsung secara sepihak dinyatakan gugur secara otomatis oleh panitia.
- Peserta yang terputus dari server osu! (disconnected) di tengah suatu map ketika pertandingan sedang berlangsung maka:
- Dalam kondisi demikian, pertandingan akan dilanjutkan seperti biasa tanpa adanya rematch. Namun, dalam kasus-kasus tertentu (semisal ketika ada peserta yang ter-disconnect sebelum lagu dimulai), map tersebut dapat diulang (di-rematch) dengan sesuai dengan keputusan dari panitia dan persetujuan dari peserta-peserta lainnya yang terlibat.
- Penggunaan program ilegal dan jasa joki pemain (multi-accounting) dalam bentuk apapun sangat dilarang keras.
- Panitia berhak untuk menindaklanjuti segala bentuk pelanggaran dengan berbagai tindakan disipliner (mulai dari teguran halus hingga pengeluaran/pendiskualifikasian peserta yang bersangkutan dari turnamen) baik dengan ataupun tanpa peringatan terlebih dahulu sebelumnya.
- Segala keputusan panitia bersifat mutlak dan tidak dapat diganggu gugat tanpa disertai bukti yang jelas untuk menyanggahnya.
`

//

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function rules() {
  return (
    <div className="m-4">
      <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-center">
        <p>Rules</p>
      </h1>
      <Markdown className='prose prose-table:w-fit pb-8' remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
    </div>
  )
}
