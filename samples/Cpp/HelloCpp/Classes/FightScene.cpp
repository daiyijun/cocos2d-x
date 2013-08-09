#include "FightScene.h"
#include "AppMacros.h"
#include "BoneAction/BoneAction.h"
#include "TableViewTestScene.h"
#include "LoadingScene.h"

#include <windows.h>
#include "direct.h" 
#include <strsafe.h>
USING_NS_CC;

CCScene* FightScene::scene()
{
    CCScene *scene = CCScene::create();
    FightScene *layer = FightScene::create();
    scene->addChild(layer);
    return scene;
}

FightScene::~FightScene(void)
{
	equipList->removeAllObjects();
	CC_SAFE_RELEASE(equipList);
}

bool FightScene::init()
{
	//if (!CCLayerColor::initWithColor(ccc4(255, 255, 255, 255)))
	if (!CCLayer::init())
    {
        return false;
    }
    setTouchEnabled(true);
	CCSize visibleSize = CCDirector::sharedDirector()->getVisibleSize();
    CCPoint origin = CCDirector::sharedDirector()->getVisibleOrigin();
	CCSize winSize = CCEGLView::sharedOpenGLView()->getFrameSize();

	def = CCBoneSpriteLayer::create("bone/AvatarSklM", "bone/AvatarSklM");
	def->setPosition(ccp(400, 50));
	def->setScale(0.5f);
	//def->runAction(CCRepeatForever::create(def->createAction("attack4", NULL)));
	//def->changeBoneTexture("bone/weapon", "weapon", "BallinBlade");
	//def->changeBoneTexture("bone/weapon", "weaponoff", "BallinBlade");
	this->addChild(def, 3);

    CCSprite* pSprite = CCSprite::create("pic/bg.png");
    pSprite->setPosition(ccp(visibleSize.width/2 + origin.x, visibleSize.height/2 + origin.y));
	this->addChild(pSprite, 0);

	//btn
	CCLabelTTF *labell = CCLabelTTF::create("refresh", "Marker Felt", 26);
	labell->setPosition(ccp(750, visibleSize.height * 13 / 14));
	this->addChild(labell);
	CCMenuItemImage *pCloseItem = CCMenuItemImage::create(
        "pic/CloseNormal.png",
        "pic/CloseSelected.png",
        this,
        menu_selector(FightScene::menuCloseCallback));
	CCMenu* pMenu =CCMenu::create(pCloseItem, NULL);
    pMenu->setPosition( CCPointZero );
	pCloseItem->setPosition(ccp(visibleSize.width * 7 / 8, visibleSize.height * 13 / 14));
	this->addChild(pMenu, 5);

	CCLabelTTF *label = CCLabelTTF::create("speed normal", "Marker Felt", 26);
	label->setTag(77);
	label->setPosition(ccp(290, visibleSize.height * 13 / 14));
	this->addChild(label);

	CCMenuItemImage *pSpeedItem = CCMenuItemImage::create(
        "pic/CloseNormal.png",
        "pic/CloseSelected.png",
        this,
        menu_selector(FightScene::menuSpeedCallback));
	CCMenu* pMenuSpeed =CCMenu::create(pSpeedItem, NULL);
    pMenuSpeed->setPosition( CCPointZero );
	pSpeedItem->setPosition(ccp(390, visibleSize.height * 13 / 14));
	this->addChild(pMenuSpeed, 5);

	//读取装备
	equipList = CCArray::create();
	equipList->retain();
	checkSkl();
	TableViewTestLayer *pLayer = TableViewTestLayer::create(equipList, this, callfuncO_selector(FightScene::streakMove));
	pLayer->setTag(33);
	pLayer->setAnchorPoint(ccp(0, 0));
	pLayer->setPosition(ccp(0, 400));
	this->addChild(pLayer);
	CCArray *fff = def->allLabel();
	TableViewTestLayer *actionLayer = TableViewTestLayer::create(fff, this, callfuncO_selector(FightScene::startAttack));
	actionLayer->setTag(44);
	actionLayer->setAnchorPoint(ccp(0, 0));
	actionLayer->setPosition(ccp(0, 0));
	this->addChild(actionLayer);
    return true;
}

void FightScene::menuSpeedCallback(CCObject* pSender)
{
	CCLabelTTF *view = (CCLabelTTF *)this->getChildByTag(77);
	std::string ff = std::string(view->getString());
	if(ff == "speed normal")
	{
		view->setString("speed slow");
		def->setAnimationInterval(1/2.0f);
	}
	else
	{
		view->setString("speed normal");
		def->setAnimationInterval(1/24.0f);
	}
}


void FightScene::menuCloseCallback(CCObject* pSender)
{
	checkSkl();
	TableViewTestLayer *view = (TableViewTestLayer *)this->getChildByTag(33);
	view->updateList(this->equipList);
}


void FightScene::startAttack(CCObject *dd)
{
	CCString *ff = (CCString *)dd;
	CCSequence *gg = CCSequence::create(def->createAction(ff->getCString(), NULL), CCCallFunc::create(this, callfunc_selector(FightScene::afterAttack)), NULL);
	def->runAction(gg);
}

void FightScene::streakMove(CCObject *dd)
{
	CCString *ff = (CCString *)dd;
	def->changeBoneTexture(ff->getCString());
}

void FightScene::afterAttack()
{
	def->runAction(CCRepeatForever::create(def->createAction("AvatarSkelM", NULL)));
}

void FightScene::checkSkl()
{
	CCSpriteFrameCache *cache = CCSpriteFrameCache::sharedSpriteFrameCache();
	std::vector<std::string>::const_iterator searchPathsIter = CCFileUtils::sharedFileUtils()->getSearchPaths().begin();
	std::string root = *searchPathsIter;
	std::string dirRoot = root.substr(0, root.length() - 1);
	dirRoot += "\\bone\\*.equip";
	WIN32_FIND_DATA FindFileData; 

	size_t size = dirRoot.length();
	wchar_t *buffer = new wchar_t[size+1];
	MultiByteToWideChar( CP_ACP, 0, dirRoot.c_str(), size, buffer, size * sizeof(wchar_t) );
	buffer[size] = 0;  // 确保以 '\0' 结尾  

	equipList->removeAllObjects();
	HANDLE hFind = FindFirstFile(buffer, &FindFileData);
	if(hFind != INVALID_HANDLE_VALUE)
	{
		do
		{
			if(FindFileData.cFileName[0]=='.')
				continue;
			if(!(FindFileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY))
			{
				char str[MAX_PATH]={0};
				WideCharToMultiByte(CP_ACP, 0, FindFileData.cFileName, sizeof(FindFileData.cFileName) + 1, str, MAX_PATH, NULL, NULL);
				std::string fgg = std::string(str);
				size_t last = 0;
				size_t index = fgg.find_first_of(".",last);
				while (index!=std::string::npos)
				{
					std::string fggg = fgg.substr(last,index-last);
					CCString *ff = CCString::create(fggg);
					CCLog(ff->getCString());
					equipList->addObject(ff);
					std::string gggg = "bone/" + fggg;
					//CCBoneTextureManager::sharedManager()->addEquip(const_cast<char*>(gggg.c_str()));
					break;
				}
			}
		}
		while(FindNextFile(hFind,&FindFileData) != 0);
	}
	//CCBoneActionManager::sharedManager()->addAnimation("bone/AvatarSklM");
	delete []buffer;
	FindClose(hFind);
}

