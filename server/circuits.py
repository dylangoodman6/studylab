"""Original study problems. Electrical data is separate from browser drawing."""
from __future__ import annotations

def r(name, n1, n2, value): return dict(id=name, kind='R', n1=n1, n2=n2, value=value, unit='Ω')
def i(name, n1, n2, value): return dict(id=name, kind='I', n1=n1, n2=n2, value=value, unit='A')
def v(name, plus, minus, value): return dict(id=name, kind='V', n1=plus, n2=minus, value=value, unit='V')
def g(name, n1, n2, gain, cp, cm): return dict(id=name, kind='G', n1=n1, n2=n2, value=gain, controlPlus=cp, controlMinus=cm, unit='S')

def p(id, title, topic, nodes, branches, equations, target, method, reason, page, hints, visual=None, error=None, meshEquations=None, matrix=None):
    upper=[n for n in nodes if n!='g']
    default_visual={'layout':'top-bus','nodePositions':{n:(180+index*280 if len(upper)==2 else 110+index*210) for index,n in enumerate(upper)},'topY':68,'groundBusY':260}
    return dict(id=id,title=title,topic=topic,nodes=nodes,branches=branches,equations=equations,
        target=target,method=method,reason=reason,source=dict(course='EE241',chapter='3',page=page,origin='مسألة أصلية مبنية على نطاق الفكرة'),
        hints=hints,visual=visual or default_visual,error=error,meshEquations=meshEquations,matrix=matrix)

PROBLEMS = [
 p('n01','تياران يدخلان عقدتين','nodal',['a','b','g'],
   [r('R1','a','g',4),r('R2','a','b',2),r('R3','b','g',6),i('I1','g','a',3),i('I2','b','g',1)],
   ['a/4+(a-b)/2=3','b/6+(b-a)/2=-1'],dict(expr='a',unit='V',label='جهد العقدة a'),
   'nodal','عقدتان مجهولتان مع مصادر تيار؛ KCL يعطي معادلتين مباشرتين.',2,
   ['راقب التيارات الداخلة والخارجة من a و b.','اكتب KCL لكل عقدة مع I=(V1-V2)/R.','a/4+(a-b)/2=3.']),
 p('n02','مصدر تيار تابع يتحكم به جهد','dependent',['a','b','g'],
   [r('R1','a','g',4),r('R2','a','b',4),r('R3','b','g',8),i('I1','g','a',2),g('G1','b','g',0.125,'a','g')],
   ['a/4+(a-b)/4=2','b/8+(b-a)/4+a/8=0'],dict(expr='b',unit='V',label='جهد العقدة b'),
   'nodal','متغير التحكم هو جهد a؛ KCL يحافظ على علاقة المصدر التابع.',2,
   ['حدد الجهد المتحكم بين a والمرجع.','تيار المصدر التابع من b إلى g يساوي a/8.','b/8+(b-a)/4+a/8=0.']),
 p('n03','مصدر جهد بين عقدتين','supernode',['a','b','g'],
   [r('R1','a','g',3),r('R2','b','g',6),i('I1','g','a',3),v('V1','a','b',6)],
   ['a/3+b/6=3','a-b=6'],dict(expr='b',unit='V',label='جهد العقدة b'),
   'nodal','مصدر الجهد بين a و b يصنع supernode؛ أضف قيد القطبية.',10,
   ['ضم العقدتين حول مصدر الجهد.','اكتب KCL لسطح العقدة الفائقة ثم فرق الجهد.','a/3+b/6=3; a-b=6.']),
 p('m04','حلقتان ومقاومة مشتركة','mesh',['a','b','g'],
   [v('V1','a','g',12),r('R1','a','b',2),r('R2','b','g',4),r('R3','a','g',6)],
   ['a=12','(b-a)/2+b/4=0'],dict(expr='(a-b)/2',unit='A',label='التيار من a إلى b'),
   'mesh','حلقتان واضحتان ومصدر جهد؛ تيارات المشّ تعطي التيار المطلوب مباشرة.',15,
   ['ارسم تيارين دائريين في الحلقتين.','استخدم KVL، وهبوط المقاومة المشتركة يتبع فرق تياري المشّ.','6(i1-i2)=12; 6(i2-i1)+2i2+4i2=0.'],
   meshEquations=['6*(i1-i2)=12','6*(i2-i1)+2*i2+4*i2=0']),
 p('m05','مصدر تيار في الفرع المشترك','supermesh',['a','b','c','g'],
   [v('V1','a','g',12),r('R1','a','b',2),r('R2','b','c',4),r('R3','c','g',2),i('I1','b','g',1)],
   ['(b-a)/2+(b-c)/4+1=0','(c-b)/4+c/2=0','a=12'],dict(expr='(b-c)/4',unit='A',label='تيار فرع b → c'),
   'mesh','مصدر التيار بين مشّين؛ اكتب KVL حول supermesh وقيد التيار.',19,
   ['تجاوز فرع مصدر التيار في مسار KVL الخارجي.','قيد المصدر يربط تياري المشّ: i1-i2=1 A.','2i1+6i2=12; i1-i2=1.'],
   meshEquations=['2*i1+6*i2=12','i1-i2=1']),
 p('c06','اختر الطريق الأقصر','choice',['a','b','g'],
   [r('R1','a','g',2),r('R2','a','b',4),r('R3','b','g',4),i('I1','g','a',3),i('I2','b','g',1)],
   ['a/2+(a-b)/4=3','b/4+(b-a)/4=-1'],dict(expr='a',unit='V',label='جهد a'),
   'nodal','يوجد مجهولا جهد مقابل ثلاثة مشّات، ومصادر التيار تلائم KCL.',25,
   ['احسب عدد جهود العقد المجهولة والمشّات.','اختر الطريقة ذات معادلات أقل والتي تناسب مصادر التيار.','عقديًا: a/2+(a-b)/4=3.']),
 p('m07','اتجاه عكسي في فرع علوي','mesh',['a','b','g'],
   [v('V1','g','a',9),r('R1','a','b',3),r('R2','b','g',6),r('R3','a','g',9)],
   ['a=-9','(b-a)/3+b/6=0'],dict(expr='(a-b)/3',unit='A',label='التيار المرجعي a → b'),
   'mesh','مصدر الجهد وحلقتان واضحتان؛ انتبه إلى أن القطب الموجب للمصدر عند g.',15,
   ['افترض اتجاهًا، ولا تغيّره بعد ظهور إشارة سالبة.','KVL حول الحلقة التي تضم المصدر يعطي جهد a سالبًا.','9(i1-i2)=-9; 9(i2-i1)+3i2+6i2=0.'],
   meshEquations=['9*(i1-i2)=-9','9*(i2-i1)+3*i2+6*i2=0']),
 p('n08','قطبية معكوسة للعقدة الفائقة','supernode',['a','b','g'],
   [r('R1','a','g',4),r('R2','b','g',2),i('I1','g','b',3),v('V1','b','a',4)],
   ['a/4+b/2=3','b-a=4'],dict(expr='a',unit='V',label='جهد العقدة a'),
   'nodal','مصدر الجهد بين عقدتين غير مرجعيتين؛ قطبه الموجب عند b.',10,
   ['اجمع a و b في عقدة فائقة.','اكتب KCL على حدودها، ثم قيد المصدر بترتيب القطبية.','a/4+b/2=3; b-a=4.']),
 p('n09','مصدر تابع مع جهد معلوم','dependent',['a','b','g'],
   [v('V1','a','g',8),r('R1','a','b',4),r('R2','b','g',4),g('G1','b','g',0.125,'a','g')],
   ['a=8','(b-a)/4+b/4+a/8=0'],dict(expr='(a-b)/4',unit='A',label='التيار من a إلى b'),
   'nodal','مصدر الجهد يثبت a مباشرة، ثم KCL عند b مع تيار المصدر التابع.',10,
   ['جهد العقدة a معلوم من مصدر الجهد.','متغير التحكم للمصدر التابع هو V(a)-V(g).','a=8; (b-a)/4+b/4+a/8=0.']),
 p('n10','مصفوفة ثلاث عقد','nodal',['a','b','c','g'],
   [r('R1','a','g',2),r('R2','a','b',4),r('R3','b','g',4),r('R4','b','c',2),r('R5','c','g',2),i('I1','g','a',4),i('I2','c','g',1)],
   ['a/2+(a-b)/4=4','(b-a)/4+b/4+(b-c)/2=0','c/2+(c-b)/2=-1'],dict(expr='b',unit='V',label='جهد العقدة b'),
   'nodal','ثلاثة جهود عقد، ومصادر تيار؛ مصفوفة الموصلية تجمع معاملات KCL.',22,
   ['كوّن صفًا لكل عقدة غير مرجعية.','القطر مجموع الموصلية، وخارج القطر سالب موصلية الفرع المشترك.','صف b: -a/4+b(1/4+1/4+1/2)-c/2=0.'],
   matrix=r'\begin{bmatrix}3/4&-1/4&0\\-1/4&1&-1/2\\0&-1/2&1\end{bmatrix}\begin{bmatrix}a\\b\\c\end{bmatrix}=\begin{bmatrix}4\\0\\-1\end{bmatrix}'),
 p('e11','اكتشف قيد المشّ الخاطئ','error',['a','b','c','g'],
   [v('V1','a','g',10),r('R1','a','b',5),r('R2','b','c',5),r('R3','c','g',5),i('I1','g','b',0.5)],
   ['a=10','(b-a)/5+(b-c)/5-0.5=0','(c-b)/5+c/5=0'],dict(expr='c',unit='V',label='جهد العقدة c'),
   'mesh','مصدر التيار في الفرع المشترك؛ KVL حول المحيط مع قيد اتجاه التيار.',19,
   ['راقب سهم مصدر التيار الصاعد.','التيار الصاعد في الفرع المشترك يساوي i2-i1.','القيد الصحيح: i2-i1=0.5 A.'],
   error=dict(question='حل جاهز كتب قيد المشّين i1−i2=+0.5 A، مع تياري مشّ باتجاه عقارب الساعة. أين الخطأ؟',
              options=['لا يوجد خطأ؛ الإشارة صحيحة','انعكست إشارة قيد مصدر التيار؛ الصحيح i2−i1=0.5 A','يجب جمع مقاومتي 5 Ω أولًا'],correct=1,type='supermesh',explanation='سهم المصدر من g إلى b (صاعد)، وفي الفرع المشترك يوافق i2 ويعاكس i1، لذا i2−i1=0.5 A.'),
   meshEquations=['5*i1+10*i2=10','i2-i1=0.5']),
 p('e12','اكتشف قطبية المصدر الخاطئة','error',['a','b','g'],
   [r('R1','a','g',2),r('R2','b','g',4),i('I1','g','a',1),v('V1','b','a',3)],
   ['a/2+b/4=1','b-a=3'],dict(expr='b',unit='V',label='جهد العقدة b'),
   'nodal','مصدر الجهد بين a و b، والطرف الموجب عند b.',10,
   ['اقرأ موضع + عند المصدر في الرسم.','قيد الجهد = جهد الموجب − جهد السالب.','القيد الصحيح: b-a=3 V.'],
   error=dict(question='حل جاهز كتب قيد العقدة الفائقة a−b=3 V. ما التصحيح؟',
              options=['القيد صحيح','القيد الصحيح b−a=3 V لأن b هو القطب الموجب','لا حاجة لقيد جهد مع supernode'],correct=1,type='supernode',explanation='قطب المصدر الموجب عند b والسالب عند a، لذلك b−a=3 V.')),
]

from english_content import english_problem
PROBLEMS = [english_problem(problem) for problem in PROBLEMS]
