#include "cocos2d.h"
#include "CCBone.h"
#include "Function.h"
#include "CCEffect.h"
USING_NS_CC;

CCBone *CCBone::createWithSpriteFrame(CCSpriteFrame *pSpriteFrame, std::string &name)
{
	CCBone *pobSprite = new CCBone();
    if (pSpriteFrame && pobSprite && pobSprite->initWithSpriteFrame(pSpriteFrame))
    {
        pobSprite->autorelease();
		pobSprite->name = name;
		pobSprite->m_pic = pSpriteFrame;

		pobSprite->setShaderProgram(CCBone::getShader());
        return pobSprite;
    }
    CC_SAFE_DELETE(pobSprite);
    return NULL;
}

CCBone *CCBone::create(std::string &name)
{
	CCBone *pobSprite = new CCBone();
	if (pobSprite && pobSprite->init())
    {
        pobSprite->autorelease();
		pobSprite->name = name;

		pobSprite->setShaderProgram(CCBone::getShader());
        return pobSprite;
    }
    CC_SAFE_DELETE(pobSprite);
    return NULL;
}

CCGLProgram *CCBone::getShader()
{
	CCGLProgram *shader = CCShaderCache::sharedShaderCache()->programForKey("boneshader");
	if (!shader)
	{
		const GLchar * ccPositionTextureBrightnessColor_frag =
		#include "ccShader_PositionTextureBrightnessColor_frag.h"
		shader = new CCGLProgram();
		shader->initWithVertexShaderByteArray(ccPositionTextureColor_vert, ccPositionTextureBrightnessColor_frag);
		shader->addAttribute(kCCAttributeNamePosition, kCCVertexAttrib_Position);
		shader->addAttribute(kCCAttributeNameColor, kCCVertexAttrib_Color);
		shader->addAttribute(kCCAttributeNameTexCoord, kCCVertexAttrib_TexCoords);
		shader->link();
		shader->updateUniforms();
		CHECK_GL_ERROR_DEBUG();
		CCShaderCache::sharedShaderCache()->addProgram(shader, "boneshader");
		shader->release();
	}
	return shader;
}

CCBone::~CCBone(void)
{
	CC_SAFE_DELETE(m_picLowWeight);
	CC_SAFE_DELETE(m_picNowWeight);
}
void CCBone::Reset()
{
	setPosition(m_startPosition);
	setRotationX(m_fStartAngleX);
	setRotationY(m_fStartAngleY);
	setScaleX(m_fStartScaleX);
	setScaleY(m_fStartAngleY);
}

const char *CCBone::getName()
{
	return this->name.c_str();
}

void CCBone::changeTexture(CCTexture2D * texture)
{
	CCRect rect = CCRectZero;
	rect.size = texture->getContentSize();
	setTexture(texture);
	setTextureRect(rect, false, rect.size);
}
void CCBone::setStartStatus(bool del)
{
	if(!del)
	{
		this->m_startPosition = this->getPosition();
		this->m_fStartAngleX = this->getRotationX();
		this->m_fStartAngleY = this->getRotationY();
		this->m_fStartScaleX = this->getScaleX();
		this->m_fStartScaleY = this->getScaleY();
		this->m_startVisable = this->isVisible();
	}
	else
	{
		this->m_fStartScaleX = this->getScaleX();
		this->m_fStartScaleY = this->getScaleY();
	}
}


void CCBone::setOffset(float top, float left)
{
     this->m_topOffset = top;
     this->m_leftOffset = left;
}
void CCBone::setStartArch(const CCPoint& anchor)
{
     this->m_startArch = anchor;
}
float CCBone::getTopOffset()
{
     return m_topOffset;
}
float CCBone::getLeftOffset()
{
     return m_leftOffset;
}

float CCBone::getBrightness()
{
	return m_brightness;
}
void CCBone::setBrightness(float brightness)
{
	if(brightness > 1)
	{
		brightness = 1.0f;
	}
	if(brightness < -1)
	{
		brightness = -1.0f;
	}
	m_brightness = brightness;
}

void CCBone::setAlpha(float alpha)
{
	if(alpha > 1)
	{
		alpha = 1.0f;
	}
	if(alpha < 0)
	{
		alpha = 0;
	}
	m_alpha = alpha;
}

float CCBone::getAlpha()
{
	return m_alpha;
}

void CCBone::draw(void)
{
	CC_PROFILER_START_CATEGORY(kCCProfilerCategorySprite, "CCSprite - draw");

    CCAssert(!m_pobBatchNode, "If CCSprite is being rendered by CCSpriteBatchNode, CCSprite#draw SHOULD NOT be called");

    CC_NODE_DRAW_SETUP();

    ccGLBlendFunc( m_sBlendFunc.src, m_sBlendFunc.dst );

    if (m_pobTexture != NULL)
    {
        ccGLBindTexture2D( m_pobTexture->getName() );
    }
    else
    {
        ccGLBindTexture2D(0);
    }

    ccGLEnableVertexAttribs( kCCVertexAttribFlag_PosColorTex );

#define kQuadSize sizeof(m_sQuad.bl)
    long offset = (long)&m_sQuad;

    // vertex
    int diff = offsetof( ccV3F_C4B_T2F, vertices);
    glVertexAttribPointer(kCCVertexAttrib_Position, 3, GL_FLOAT, GL_FALSE, kQuadSize, (void*) (offset + diff));

    // texCoods
    diff = offsetof( ccV3F_C4B_T2F, texCoords);
    glVertexAttribPointer(kCCVertexAttrib_TexCoords, 2, GL_FLOAT, GL_FALSE, kQuadSize, (void*)(offset + diff));

    // color
    diff = offsetof( ccV3F_C4B_T2F, colors);
    glVertexAttribPointer(kCCVertexAttrib_Color, 4, GL_UNSIGNED_BYTE, GL_TRUE, kQuadSize, (void*)(offset + diff));

	GLint c0 = glGetUniformLocation(getShaderProgram()->getProgram(), "brightness");
	glUniform1f(c0, m_brightness);

	GLint c1 = glGetUniformLocation(getShaderProgram()->getProgram(), "alpha");
	glUniform1f(c1, m_alpha);

    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

    CHECK_GL_ERROR_DEBUG();


#if CC_SPRITE_DEBUG_DRAW == 1
    // draw bounding box
    CCPoint vertices[4]={
        ccp(m_sQuad.tl.vertices.x,m_sQuad.tl.vertices.y),
        ccp(m_sQuad.bl.vertices.x,m_sQuad.bl.vertices.y),
        ccp(m_sQuad.br.vertices.x,m_sQuad.br.vertices.y),
        ccp(m_sQuad.tr.vertices.x,m_sQuad.tr.vertices.y),
    };
    ccDrawPoly(vertices, 4, true);
#elif CC_SPRITE_DEBUG_DRAW == 2
    // draw texture box
    CCSize s = this->getTextureRect().size;
    CCPoint offsetPix = this->getOffsetPosition();
    CCPoint vertices[4] = {
        ccp(offsetPix.x,offsetPix.y), ccp(offsetPix.x+s.width,offsetPix.y),
        ccp(offsetPix.x+s.width,offsetPix.y+s.height), ccp(offsetPix.x,offsetPix.y+s.height)
    };
    ccDrawPoly(vertices, 4, true);
#endif // CC_SPRITE_DEBUG_DRAW

    CC_INCREMENT_GL_DRAWS(1);

    CC_PROFILER_STOP_CATEGORY(kCCProfilerCategorySprite, "CCSprite - draw");
}

void CCBone::setFrame(CCArray *boneArray, int frameInAll, int frameInAction)
{
	CCObject* child = NULL;
	char str[256]={0};
	Func::itostr(frameInAll, str);
	CCARRAY_FOREACH(boneArray, child)
	{
		CCBone *ch = (CCBone *)child;
		if(frameInAll > ch->endFrame)
		{
			ch->setVisible(false);
			continue;
		}
		Json *source = Json_getItem(ch->m_frame, str);
		if (source)
		{
			int c = Json_getSize(source);
			if(c <= 0)
			{
				return;
			}
			CCAssert(c == 8, "count error");
			float posX = Json_getItemAt(source, 0)->valuefloat;
			float posY = Json_getItemAt(source, 1)->valuefloat;
			float scaleX = Json_getItemAt(source, 2)->valuefloat;
			float scaleY = Json_getItemAt(source, 3)->valuefloat;
			float skewX = Json_getItemAt(source, 4)->valuefloat;
			float skewY = Json_getItemAt(source, 5)->valuefloat;
			float visable = Json_getItemAt(source, 6)->valuefloat;
			float brightness = Json_getItemAt(source, 7)->valuefloat;

			ch->setBrightness(brightness);
			float fX = 0;
			float fY = 0;
			if(ch->m_masked)
			{
				CCBoneClip *tm = (CCBoneClip *)ch->getParent();
				fX = tm->m_offsetX;
				fY = tm->m_offsetY;
			}
			ch->setPosition(ccp(ch->m_startPosition.x + posX - fX, ch->m_startPosition.y + posY - fY));
			ch->setRotationX(ch->m_fStartAngleX + skewX);
			ch->setRotationY(ch->m_fStartAngleY + skewY);
			ch->setScaleX(ch->m_fStartScaleX * scaleX);
			ch->setScaleY(ch->m_fStartScaleY * scaleY);

			bool vis = ch->isVisible();

			float alf = ch->getAlpha();
			if(vis != (bool)(int)visable || alf != visable)
			{ 
				if((bool)(int)visable)
				{
					ch->setVisible(true);
					ch->setAlpha(1.0f);
				}
				else if(visable <= 0)
				{
					ch->setVisible(false);
					ch->setAlpha(0);
				}
				else
				{
					ch->setVisible(true);
					ch->setAlpha(visable);
				}
			}
		}
		else
		{
			if(frameInAction == 0)
			{
				ch->setPosition(ccp(ch->m_startPosition.x, ch->m_startPosition.y));
				ch->setRotationX(ch->m_fStartAngleX);
				ch->setRotationY(ch->m_fStartAngleY);
				ch->setScaleX(ch->m_fStartScaleX);
				ch->setScaleY(ch->m_fStartScaleY);
				ch->setVisible((bool)ch->m_startVisable);
			}
		}
	}
}
