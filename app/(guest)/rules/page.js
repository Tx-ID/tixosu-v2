
const markdownContent = `# title here

another amazing stuff down here

|   | table   | here    |
|---|---------|---------|
| 1 | content | AMAZING |

this is cool markdown!
`

//

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Home() {
  return (
    <div className="ml-2 mt-2">
      <Markdown className='prose prose-table:w-fit' remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
    </div>
  )
}
